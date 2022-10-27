import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Dimensions, StyleSheet, ImageStyle } from 'react-native';
import { Divider, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
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
} from '~/graphql/generated/generated';
import globalStyle, { MAX_WIDTH } from '~/styles/global';
import AssessAvg from '~/components/proposal/AssessAvg';
import { getProposalStatusString } from '~/components/status/ProgressMark';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';
import { StringWeiAmountFormat } from '~/utils/votera/voterautil';
import { useAppDispatch } from '~/state/hooks';
import { getCommonPeriodText } from '~/utils/time';
import { getDefaultAssessPeriod, PreviewProposal } from '~/types/proposalType';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_MAX_WIDTH = SCREEN_WIDTH - 46;

const COLUMN_WIDTH = 70;

function LineComponent(): JSX.Element {
    return <Divider style={{ marginVertical: 30 }} />;
}

const styles = StyleSheet.create({
    container: { marginBottom: 90 },
    description: { fontSize: 13, lineHeight: 23, width: '100%' },
    label: { fontSize: 13, lineHeight: 25, width: COLUMN_WIDTH },
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
    previewData: PreviewProposal | undefined;
    isPreview: boolean;
    assessResultData: AssessResultPayload;
    onLayout: (h: number) => void;
}

function Info(props: Props): JSX.Element {
    const themeContext = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const { previewData, assessResultData, isPreview, onLayout } = props;
    const { proposal } = useContext(ProposalContext);
    const [type, setType] = useState<EnumProposalType>();
    const [proposalStatus, setProposalStatus] = useState<string>();
    const [assessPeriod, setAssessPeriod] = useState<string>();
    const [votePeriod, setVotePeriod] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [name, setName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [logo, setLogo] = useState<AttachmentImage>();
    const [images, setImages] = useState<(AttachmentImage | undefined)[]>([]);
    const [files, setFiles] = useState<AttachmentFile[]>([]);
    const [viewWidth, setViewWidth] = useState(MAX_WIDTH);

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
                onLayout(event.nativeEvent.layout.height);
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
                    <Text style={[globalStyle.rtext, styles.label]}>{getString('제안유형')}</Text>
                    <Text style={[globalStyle.ltext, styles.labelText]}>
                        {type === EnumProposalType.Business ? getString('사업제안') : getString('시스템제안')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={[globalStyle.rtext, styles.label]}>{getString('제안제목')}</Text>
                    <Text style={[globalStyle.ltext, styles.labelText, { maxWidth: viewWidth - COLUMN_WIDTH }]}>
                        {name}
                    </Text>
                </View>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.rtext, styles.label]}>{getString('제안상태')}</Text>
                    <Text style={[globalStyle.ltext, styles.labelText]}>{proposalStatus}</Text>
                </View>
                {type === EnumProposalType.Business && (
                    <View style={globalStyle.flexRowAlignCenter}>
                        <Text style={[globalStyle.rtext, styles.label]}>{getString('평가기간')}</Text>
                        <Text style={[globalStyle.ltext, styles.labelText]}>{assessPeriod}</Text>
                    </View>
                )}
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.rtext, styles.label]}>{getString('투표기간')}</Text>
                    <Text style={[globalStyle.ltext, styles.labelText]}>{votePeriod}</Text>
                </View>
                {type === EnumProposalType.Business && (
                    <View style={globalStyle.flexRowAlignCenter}>
                        <Text style={[globalStyle.rtext, styles.label]}>{getString('요청금액')}</Text>
                        <Text style={[globalStyle.btext, styles.labelText, { color: themeContext.color.primary }]}>
                            {amount} BOA
                        </Text>
                    </View>
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
