import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Dimensions, StyleSheet, ImageStyle, TouchableOpacity } from 'react-native';
import { Divider, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { setStringAsync } from 'expo-clipboard';
import {
    AttachmentFile,
    AttachmentImage,
    imagePickerToAttachmentImage,
    uploadFileToAttachmentImage,
    adjustAttachmentImage,
    filterAttachment,
} from '~/utils/attach';
import DownloadComponent from '~/components/ui/Download';
import {
    Enum_Proposal_Type as EnumProposalType,
    AssessResultPayload,
    Enum_Assess_Proposal_State as EnumAssessProposalState,
    ComponentCommonPeriodInput,
    Proposal,
} from '~/graphql/generated/generated';
import globalStyle, { MAX_WIDTH } from '~/styles/global';
import AssessAvg from '~/components/proposal/AssessAvg';
import { getProposalStatusString } from '~/components/status/ProgressMark';
import getString, { getLocale } from '~/utils/locales/STRINGS';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import { useAppDispatch } from '~/state/hooks';
import { getCommonPeriodText } from '~/utils/time';
import { getDefaultAssessPeriod, PreviewProposal } from '~/types/proposalType';
import { CopyIcon } from '~/components/icons';
import { showSnackBar } from '~/state/features/snackBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_MAX_WIDTH = SCREEN_WIDTH - 46;
const ELLIPSIS_TAIL_SIZE = -10;

function getColumnWidth() {
    const locale = getLocale();
    return locale.startsWith('ko') ? 70 : 140;
}

function LineComponent(): JSX.Element {
    return <Divider style={{ marginVertical: 30 }} />;
}

const styles = StyleSheet.create({
    container: { marginBottom: 90 },
    description: { fontSize: 13, lineHeight: 23, width: '100%' },
    label: { fontSize: 13, lineHeight: 25 },
    labelId: { fontSize: 13, lineHeight: 25 },
    labelText: { fontSize: 13, lineHeight: 25 },
    logoWrapper: { alignItems: 'center', paddingBottom: 35, paddingTop: 45 },
    title: { fontSize: 13, lineHeight: 26 },
    titleWrapper: { marginBottom: 28 },
});

function getResizedImageSize(image: AttachmentImage, width: number): ImageStyle {
    if (!image?.width) return {};
    if (image.width > width) {
        return { width, height: ((image?.height || 0) * width) / image.width };
    }
    return { width: image.width, height: image.height };
}

interface Props {
    proposal: Proposal | undefined;
    previewData: PreviewProposal | undefined;
    isPreview: boolean;
    assessResultData: AssessResultPayload;
}

function Info(props: Props): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { proposal, previewData, assessResultData, isPreview } = props;
    const [type, setType] = useState<EnumProposalType>();
    const [proposalStatus, setProposalStatus] = useState<string>();
    const [assessPeriod, setAssessPeriod] = useState<string>();
    const [votePeriod, setVotePeriod] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [name, setName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [proposalId, setProposalId] = useState('');
    const [proposer, setProposer] = useState('');
    const [logo, setLogo] = useState<AttachmentImage>();
    const [images, setImages] = useState<(AttachmentImage | undefined)[]>([]);
    const [files, setFiles] = useState<AttachmentFile[]>([]);
    const [viewWidth, setViewWidth] = useState(MAX_WIDTH);

    const columnWidth = getColumnWidth();

    useEffect(() => {
        let canceled = false;
        if (isPreview && previewData) {
            setType(previewData.type);
            setProposalStatus(getString('작성중'));
            setAssessPeriod(getCommonPeriodText(getDefaultAssessPeriod()));
            setVotePeriod(getCommonPeriodText(previewData.votePeriod as ComponentCommonPeriodInput));
            setAmount(StringWeiAmountFormat(previewData.fundingAmount));
            setName(previewData.name);
            setDescription(previewData.description);
            setProposalId('');
            setProposer('');
            const logoImage = previewData.logoImage ? imagePickerToAttachmentImage(previewData.logoImage) : undefined;
            if (logoImage) {
                adjustAttachmentImage(logoImage, IMAGE_MAX_WIDTH)
                    .then((img) => {
                        if (!canceled) {
                            setLogo(img);
                        }
                    })
                    .catch(console.log);
            } else {
                setLogo(undefined);
            }
            const mainImage = previewData.mainImage ? imagePickerToAttachmentImage(previewData.mainImage) : undefined;
            if (mainImage) {
                adjustAttachmentImage(mainImage, IMAGE_MAX_WIDTH)
                    .then((img) => {
                        if (!canceled) {
                            setImages([img]);
                        }
                    })
                    .catch(console.log);
            } else {
                setImages([]);
            }
            setFiles([]);
        } else if (proposal) {
            setType(proposal.type);
            setProposalStatus(getProposalStatusString(proposal.status, !!proposal.paidComplete));
            setAssessPeriod(getCommonPeriodText(proposal.assessPeriod));
            setVotePeriod(getCommonPeriodText(proposal.votePeriod));
            setAmount(StringWeiAmountFormat(proposal.fundingAmount));
            setName(proposal.name || '');
            setDescription(proposal.description || '');
            setProposalId(proposal.proposalId || '');
            setProposer(proposal.proposer_address || '');
            const logoImage = proposal.logo ? uploadFileToAttachmentImage(proposal.logo) : undefined;
            if (logoImage) {
                adjustAttachmentImage(logoImage, IMAGE_MAX_WIDTH)
                    .then((img) => {
                        if (!canceled) {
                            setLogo(img);
                        }
                    })
                    .catch(console.log);
            } else {
                setLogo(undefined);
            }
            if (proposal.attachment) {
                const filter = filterAttachment(proposal.attachment);
                setFiles(filter.files);
                Promise.all(filter.images.map((a) => adjustAttachmentImage(a, IMAGE_MAX_WIDTH)))
                    .then((result) => {
                        if (!canceled) {
                            setImages(result);
                        }
                    })
                    .catch(console.log);
            } else {
                setImages([]);
                setFiles([]);
            }
        }
        return () => {
            canceled = true;
        };
    }, [proposal, isPreview, previewData]);

    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                setViewWidth(event.nativeEvent.layout.width);
            }}
        >
            {logo && (
                <View style={styles.logoWrapper}>
                    <Image
                        style={getResizedImageSize(logo, viewWidth / 2)}
                        resizeMode="contain"
                        source={{ uri: logo.url }}
                    />
                </View>
            )}
            <View>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                        {getString('제안유형')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.labelText, { maxWidth: viewWidth - columnWidth }]}>
                        {type === EnumProposalType.Business ? getString('사업제안') : getString('시스템제안')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                        {getString('제안제목')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.labelText, { maxWidth: viewWidth - columnWidth }]}>
                        {name}
                    </Text>
                </View>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                        {getString('제안상태')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.labelText, { maxWidth: viewWidth - columnWidth }]}>
                        {proposalStatus}
                    </Text>
                </View>
                {type === EnumProposalType.Business && (
                    <View style={globalStyle.flexRowAlignCenter}>
                        <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                            {getString('평가기간')}
                        </Text>
                        <Text style={[globalStyle.ltext, styles.labelText, { maxWidth: viewWidth - columnWidth }]}>
                            {assessPeriod}
                        </Text>
                    </View>
                )}
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                        {getString('투표기간')}
                    </Text>
                    <Text style={[globalStyle.ltext, styles.labelText, { maxWidth: viewWidth - columnWidth }]}>
                        {votePeriod}
                    </Text>
                </View>
                {type === EnumProposalType.Business && (
                    <View style={globalStyle.flexRowAlignCenter}>
                        <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                            {getString('요청금액')}
                        </Text>
                        <Text style={[globalStyle.btext, styles.labelText, { color: themeContext.color.primary }]}>
                            {amount} BOA
                        </Text>
                    </View>
                )}
                {!isPreview && (
                    <>
                        <View style={globalStyle.flexRowAlignCenter}>
                            <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                                {getString('제안ID')}
                            </Text>
                            <View style={{ flexDirection: 'row', width: viewWidth - columnWidth }}>
                                <Text style={[globalStyle.ltext, styles.labelId]} numberOfLines={1}>
                                    {proposalId.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.ltext, styles.labelId]}>
                                    {proposalId.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <TouchableOpacity
                                    style={{ marginLeft: 8, marginTop: 2 }}
                                    onPress={() => {
                                        setStringAsync(proposalId)
                                            .then(() => {
                                                dispatch(showSnackBar(getString('클립보드에 복사되었습니다')));
                                            })
                                            .catch(console.log);
                                    }}
                                >
                                    <CopyIcon color={themeContext.color.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={globalStyle.flexRowAlignCenter}>
                            <Text style={[globalStyle.rtext, styles.label, { width: columnWidth }]}>
                                {getString('제안자')}
                            </Text>
                            <View style={{ flexDirection: 'row', width: viewWidth - columnWidth }}>
                                <Text style={[globalStyle.ltext, styles.labelId]} numberOfLines={1}>
                                    {proposer.slice(0, ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <Text style={[globalStyle.ltext, styles.labelId]}>
                                    {proposer.slice(ELLIPSIS_TAIL_SIZE)}
                                </Text>
                                <View style={{ marginLeft: 8, width: 20 }} />
                            </View>
                        </View>
                    </>
                )}
            </View>

            {images && images.length > 0 && images[0] && (
                <Image
                    style={[{ marginTop: 30 }, getResizedImageSize(images[0], viewWidth)]}
                    source={{ uri: images[0].url }}
                />
            )}

            <LineComponent />

            <View style={styles.titleWrapper}>
                <Text style={[globalStyle.rtext, styles.title]}>{getString('목표 및 설명')}</Text>
            </View>

            <Text style={[globalStyle.ltext, styles.description]}>{description}</Text>

            {images &&
                images
                    .slice(1)
                    .map((image, index) =>
                        image ? (
                            <Image
                                key={`image_${image.id || index.toString()}`}
                                style={[{ marginTop: 30 }, getResizedImageSize(image, viewWidth)]}
                                source={{ uri: image.url }}
                            />
                        ) : null,
                    )}

            <LineComponent />

            {type === EnumProposalType.Business && assessResultData?.proposalState !== EnumAssessProposalState.Invalid && (
                <>
                    <View style={styles.titleWrapper}>
                        <Text style={[globalStyle.rtext, styles.title]}>{getString('적합도 평가')}</Text>
                    </View>

                    <AssessAvg assessResultData={assessResultData} />
                    <LineComponent />
                </>
            )}

            {files?.length ? (
                <>
                    <View style={styles.titleWrapper}>
                        <Text style={[globalStyle.rtext, styles.title]}>{getString('첨부파일')}</Text>
                    </View>
                    {files.map((file) => {
                        return <DownloadComponent key={`file_${file.id || ''}`} file={file} />;
                    })}
                </>
            ) : null}
        </View>
    );
}

export default Info;
