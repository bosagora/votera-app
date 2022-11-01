import React, { useState, useContext, useCallback, PropsWithChildren } from 'react';
import { View, Image, ImageURISource } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ImagePickerResult } from 'expo-image-picker';
import { DocumentResult } from 'expo-document-picker';
import { Button, Input, Text } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from 'styled-components/native';
import { useAssets } from 'expo-asset';
import ImagePicker from '~/components/input/ImagePicker';
import DocumentPicker from '~/components/input/DocumentPicker';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
import ShortButton from '~/components/button/ShortButton';
import TextInputComponent from '~/components/input/SingleLineInput';
import { loadUriAsFile } from '~/graphql/client';
import { Enum_Post_Type as EnumPostType, useUploadFileMutation } from '~/graphql/generated/generated';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch } from '~/state/hooks';
import { showLoadingAniModal, hideLoadingAniModal } from '~/state/features/loadingAniModal';
import { ProposalContext } from '~/contexts/ProposalContext';
import { ChevronLeftIcon } from '~/components/icons';

const TITLE_MAX_LENGTH = 100;
// const HEADER_BG_WIDTH = Dimensions.get('window').width;

enum EnumIconAsset {
    Background = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/header/bg.png')];

interface RowProps {
    label: string;
    mandatory?: boolean;
    subTitle?: string;
}

function RowWrapper(props: PropsWithChildren<RowProps>): JSX.Element {
    const { label, mandatory, subTitle, children } = props;
    return (
        <View style={{ marginTop: 10 }}>
            <View style={globalStyle.flexRowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[globalStyle.mtext, { fontSize: 13, marginVertical: 15, color: 'black' }]}>
                        {label}
                    </Text>
                    {mandatory && (
                        <View style={{ width: 3, height: 3, backgroundColor: 'rgb(240,109,63)', marginLeft: 11 }} />
                    )}
                </View>
                <Text style={[globalStyle.ltext, { fontSize: 12 }]}>{subTitle}</Text>
            </View>
            {children}
        </View>
    );
}

RowWrapper.defaultProps = {
    mandatory: false,
    subTitle: '',
};

function CreateNoticeScreen({ navigation, route }: MainScreenProps<'CreateNotice'>): JSX.Element {
    const { id: activityId } = route.params;
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const themeContext = useContext(ThemeContext);
    const { createProposalNotice } = useContext(ProposalContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState<ImagePickerResult>();
    const [uploadFiles, setUploadFiles] = useState<DocumentResult[]>([]);
    const [assets] = useAssets(iconAssets);

    const [uploadAttachment] = useUploadFileMutation();

    const runCreateNotice = useCallback(
        async (noticeTitle: string, noticeDescription: string) => {
            try {
                let uploadedFileUrl: (string | undefined)[] | undefined;
                const uploadedAttachmentUrls: (string | undefined)[] = [];
                if (!noticeTitle || !noticeDescription) return;

                dispatch(showLoadingAniModal());

                if (mainImage && !mainImage.cancelled) {
                    const result = await loadUriAsFile(mainImage?.uri);
                    if (result) {
                        const info = mainImage.exif?.name ? { name: mainImage.exif?.name as string } : {};
                        const uploaded = await uploadAttachment({ variables: { file: result, info } });
                        uploadedAttachmentUrls.push(uploaded.data?.upload.id);
                    }
                }
                if (uploadFiles) {
                    const uploadFilePromises = uploadFiles
                        .filter((file) => file.type !== 'cancel' && file?.uri)
                        .map(async (uploadFile) => {
                            if (uploadFile.type === 'cancel' || !uploadFile?.uri) {
                                return undefined;
                            }

                            const result = await loadUriAsFile(uploadFile.uri, uploadFile.name);
                            if (result) {
                                const uploaded = await uploadAttachment({
                                    variables: { file: result, info: { name: uploadFile.name } },
                                });
                                return uploaded.data?.upload.id;
                            }

                            return undefined;
                        });
                    uploadedFileUrl = await Promise.all(uploadFilePromises);
                    uploadedAttachmentUrls.push(...uploadedFileUrl);
                }

                await createProposalNotice(activityId, noticeTitle, noticeDescription, uploadedAttachmentUrls, {
                    id: activityId,
                    type: EnumPostType.BoardArticle,
                    sort: 'createdAt:desc',
                });

                dispatch(hideLoadingAniModal());
                if (navigation.canGoBack()) {
                    navigation.pop();
                } else {
                    navigation.dispatch(replaceToHome());
                }
            } catch (e) {
                console.log('CreateNotice error : ', e);
                dispatch(hideLoadingAniModal());
            }
        },
        [activityId, createProposalNotice, dispatch, mainImage, navigation, uploadAttachment, uploadFiles],
    );

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.pop();
                    } else {
                        navigation.dispatch(replaceToHome());
                    }
                }}
                icon={<ChevronLeftIcon color="white" />}
                type="clear"
            />
        );
    }, [navigation]);

    const headerRight = useCallback(() => {
        return (
            <ShortButton
                title={getString('등록')}
                titleStyle={[globalStyle.btext, { fontSize: 14, color: 'white' }]}
                buttonStyle={{
                    backgroundColor: 'transparent',
                    width: 63,
                    height: 32,
                    padding: 0,
                    borderRadius: 47,
                    borderColor: 'white',
                }}
                onPress={() => {
                    runCreateNotice(title, description).catch(console.log);
                }}
            />
        );
    }, [description, runCreateNotice, title]);

    const headerBackground = useCallback(() => {
        return (
            <>
                {assets && (
                    <Image
                        style={{ height: TOP_NAV_HEIGHT + insets.top, width: '100%' }}
                        source={assets[EnumIconAsset.Background] as ImageURISource}
                    />
                )}
                <View style={globalStyle.headerBackground} />
            </>
        );
    }, [assets, insets.top]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: getString('공지사항 작성'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerTitleAlign: 'center',
            headerLeft,
            headerRight,
            headerBackground,
            headerShown: true,
        });
    }, [headerBackground, headerLeft, headerRight, navigation]);

    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <KeyboardAwareScrollView style={{ flex: 1 }} enableResetScrollToCoords={false}>
                <View
                    style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        paddingHorizontal: 23,
                        paddingBottom: 100,
                    }}
                >
                    <RowWrapper label={getString('공지사항 제목')} mandatory>
                        <TextInputComponent
                            onChangeText={(text: string) => setTitle(text)}
                            value={title}
                            koreanInput
                            placeholder={getString('공지사항 제목을 입력해주세요&#46;')}
                            maxLength={TITLE_MAX_LENGTH}
                        />
                        {/* <TextInput placeholder='' onChangeText={(text: string) => setTitle(text)} /> */}
                    </RowWrapper>

                    <RowWrapper label={getString('공지사항 내용')} mandatory>
                        <Input
                            value={description}
                            textAlignVertical="top"
                            placeholder={getString('공지사항 내용을 입력해주세요&#46;')}
                            multiline
                            style={{ textAlignVertical: 'top', height: 255, paddingTop: 15, lineHeight: 23 }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            inputStyle={[
                                globalStyle.rtext,
                                {
                                    color: themeContext.color.textBlack,
                                    fontSize: 14,
                                    outlineStyle: 'none',
                                },
                            ]}
                            containerStyle={{
                                borderWidth: 2,
                                borderColor: 'rgb(235,234,239)',
                                backgroundColor: 'rgb(252,251,255)',
                                borderRadius: 5,
                            }}
                            onChangeText={(text: string) => setDescription(text)}
                            renderErrorMessage={false}
                            allowFontScaling={false}
                            autoCorrect={false}
                            autoCompleteType={undefined}
                        />
                        {/* <TextInput textAlignVertical='top' placeholder='공지사항 내용을 입력해주세요' multiline={true} style={{ textAlignVertical: 'top', height: 255, paddingTop: 15, lineHeight: 23 }} onChangeText={(text: string) => setDescription(text)} /> */}
                    </RowWrapper>

                    <RowWrapper label={getString('대표 이미지')} subTitle={getString('png와 jpg파일 1M이하로 등록')}>
                        <ImagePicker
                            showImage
                            onChangeImage={(image) => setMainImage(image)}
                            value={mainImage}
                            placeholder={getString('대표 이미지를 등록해주세요')}
                        />
                    </RowWrapper>

                    <RowWrapper
                        label={getString('자료 업로드')}
                        subTitle={getString('png, jpg, pdf 파일 10M이하로 5개까지 등록')}
                    >
                        <DocumentPicker
                            onChangeFiles={(files) => setUploadFiles(files)}
                            value={uploadFiles}
                            placeholder={getString('자료를 등록해주세요')}
                            fileType={['application/pdf', 'image/jpeg', 'image/png']}
                        />
                    </RowWrapper>
                </View>
            </KeyboardAwareScrollView>
        </>
    );
}

export default CreateNoticeScreen;
