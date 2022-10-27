/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
    ApolloClient,
    InMemoryCache,
    from,
    ApolloLink,
    split as apolloSplit,
    FieldMergeFunction,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createUploadLink, ReactNativeFile } from 'apollo-upload-client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import fetch from 'cross-fetch';
import { httpLinkURI, webSocketURI } from '@config/ServerConfig';
import mime from 'mime/lite';
import dayjs from 'dayjs';

console.log(`Link=${httpLinkURI as string} , ${webSocketURI as string}`);

let contextToken: string | undefined;

const httpLink = createUploadLink({
    uri: `${httpLinkURI as string}/graphql`,
    credentials: 'include',
    fetch: (uri: RequestInfo, options?: RequestInit): Promise<Response> => {
        return fetch(uri, options);
    },
});

const wsClient = createClient({
    url: webSocketURI as string,
});
const wsLink = new GraphQLWsLink(wsClient);

export function setToken(token: string) {
    if (token !== contextToken) {
        contextToken = token;
    }
}

export function resetToken() {
    contextToken = undefined;
}

const authMiddleware = setContext((req, context) => {
    console.group(`${dayjs().format('HH:mm:ss.SSS')} | Apollo call - `, req.operationName);
    console.info('Variables = ', req.variables);
    console.groupEnd();
    const { token } = context;

    if (!contextToken && !token) {
        return context;
    }
    return {
        headers: {
            ...context.headers,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            authorization: `Bearer ${token || contextToken}`,
        },
    };
});

const passThroughLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((result) => {
        console.group(`${dayjs().format('HH:mm:ss.SSS')} | Apollo response - `, operation.operationName);
        console.info('result.data = ', result.data);
        console.groupEnd();
        return result;
    });
});

const fnCacheMerge: FieldMergeFunction<any, any> = (existing, incoming, { variables }) => {
    let offset: number = variables?.start || 0;
    const merged = existing && Array.isArray(existing) ? existing.slice(0) : [];
    if (incoming && Array.isArray(incoming) && incoming.length) {
        const first = incoming[0];
        if (first.id !== undefined) {
            for (let i = 0; i < offset; i += 1) {
                if (merged[i].id === first.id) {
                    offset = i;
                    break;
                }
            }
        }
        if (incoming.length + offset > merged.length) {
            const count = merged.length - offset;
            for (let i = 0; i < count; i += 1) {
                merged[offset + i] = incoming[i];
            }
            if (count <= 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                merged.push(...incoming);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                merged.push(...incoming.slice(count));
            }
        } else {
            for (let i = 0; i < incoming.length; i += 1) {
                merged[offset + i] = incoming[i];
            }
        }
    }
    return merged;
};

const client = new ApolloClient({
    link: from([
        onError((err) => {
            const { graphQLErrors, networkError, operation, response } = err;
            if (graphQLErrors) {
                graphQLErrors.forEach(({ message, locations, path }) => {
                    console.group(`[GraphQL error]: Message: ${message}`);
                    console.log('- Location : ', locations);
                    console.log('- Path : ', path);
                    console.groupEnd();
                });
            }
            if (networkError) {
                console.group('[Network error]: ', networkError);
                console.log('- operation : ', operation);
                console.log('- response : ', response);
                console.groupEnd();
            }
        }),
        apolloSplit(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
            },
            wsLink,
            from([authMiddleware, passThroughLink, httpLink]),
        ),
    ]),
    cache: new InMemoryCache({
        typePolicies: {
            ActivityPostsPayload: {
                fields: {
                    values: {
                        merge: fnCacheMerge,
                    },
                    statuses: {
                        merge: fnCacheMerge,
                    },
                },
            },
            PostCommentsPayload: {
                fields: {
                    values: {
                        merge: fnCacheMerge,
                    },
                    statuses: {
                        merge: fnCacheMerge,
                    },
                },
            },
            ListProposalPayload: {
                fields: {
                    values: {
                        merge: fnCacheMerge,
                    },
                    statuses: {
                        merge: fnCacheMerge,
                    },
                },
            },
            ListFeedsPayload: {
                fields: {
                    values: {
                        merge: fnCacheMerge,
                    },
                },
            },
            MemberRoleConnection: {
                fields: {
                    values: {
                        merge: fnCacheMerge,
                    },
                },
            },
            Query: {
                fields: {
                    listProposal: {
                        keyArgs: ['sort', 'where'],
                    },
                    activityPosts: {
                        keyArgs: ['id', 'type', 'sort'],
                    },
                    postComments: {
                        keyArgs: ['id', 'sort'],
                    },
                    memberRolesConnection: {
                        keyArgs: ['sort', 'where'],
                    },
                    listAssessValidators: {
                        keyArgs: ['proposalId'],
                        merge: fnCacheMerge,
                    },
                    listBallotValidators: {
                        keyArgs: ['proposalId'],
                        merge: fnCacheMerge,
                    },
                    listFeeds: {
                        keyArgs: ['sort', 'where'],
                    },
                },
            },
        },
    }),
});

export const loadUriAsFile = async (uri: string, name?: string): Promise<ReactNativeFile | Blob> => {
    if (uri.startsWith('file:')) {
        const filename = name || uri.split('/').pop();
        return new ReactNativeFile({
            uri,
            name: filename,
            type: mime.getType(filename || '') || 'application/octet-stream',
        });
    }

    if (uri.startsWith('https://') || uri.startsWith('http://')) {
        return { uri };
    }

    return fetch(uri).then((response) => response.blob());
};

export default client;
