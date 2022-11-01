import React, { useState, useContext, PropsWithChildren, useCallback, useEffect } from 'react';
import { View, Image, Platform, ImageURISource, ActivityIndicator, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ThemeContext } from 'styled-components/native';
import { Button, Text, Input, Icon } from 'react-native-elements';
import { ImagePickerResult } from 'expo-image-picker';
import { DocumentResult } from 'expo-document-picker';
import { useAssets } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigNumber } from 'ethers';
import globalStyle, { TOP_NAV_HEIGHT } from '~/styles/global';
import RadioButton from '~/components/button/radio';
import TextInputComponent from '~/components/input/SingleLineInput';
import DatePicker, { Day } from '~/components/input/DatePicker';
import ImagePicker from '~/components/input/ImagePicker';
import DocumentPicker from '~/components/input/DocumentPicker';
import ShortButton from '~/components/button/ShortButton';
import {
    Enum_Proposal_Status as EnumProposalStatus,
    Enum_Proposal_Type as EnumProposalType,
    ProposalInput,
    useUploadFileMutation,
} from '~/graphql/generated/generated';
import { loadUriAsFile } from '~/graphql/client';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import LocalStorage, { LocalStorageProposalProps } from '~/utils/LocalStorage';
import { AuthContext, MetamaskStatus } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { OpenWhere, ProjectWhere } from '~/graphql/hooks/Proposals';
import {
    StringToWeiAmount,
    WeiAmountToString,
    calculateProposalFee,
    IsValidAmountString,
} from '~/utils/votera/voterautil';
import { isValidFundAmount } from '~/utils/votera/agoraconf';
import getString from '~/utils/locales/STRINGS';
import { useAppDispatch, useAppSelector } from '~/state/hooks';
import { showSnackBar } from '~/state/features/snackBar';
import { showLoadingAniModal, hideLoadingAniModal } from '~/state/features/loadingAniModal';
import { selectDatePickerState, resetDatePicker } from '~/state/features/selectDatePicker';
import { getDefaultAssessPeriod, PreviewProposal } from '~/types/proposalType';
import { MainScreenProps, replaceToHome } from '~/navigation/main/MainParams';
import { savePreviewToSession } from '~/utils/votera/preview';
import { isValidBusinessVoteDate } from '~/utils/time';
import { ChevronLeftIcon } from '~/components/icons';

const TITLE_MAX_LENGTH = 255;
// const HEADER_BG_WIDTH = Dimensions.get('window').width;

enum EnumIconAsset {
    Background = 0,
}

// eslint-disable-next-line global-require, import/extensions
const iconAssets = [require('@assets/images/header/bg.png')];

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        borderColor: 'white',
        borderRadius: 47,
        height: 32,
        marginRight: 23,
        padding: 0,
        width: 63,
    },
    buttonDisabled: {
        backgroundColor: 'transparent',
    },
    buttonTitle: {
        color: 'white',
        fontSize: 14,
        lineHeight: 20,
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingHorizontal: 23,
        paddingVertical: 29,
        top: -5,
    },
    descriptionContainer: {
        backgroundColor: 'rgb(252,251,255)',
        borderColor: 'rgb(235,234,239)',
        borderRadius: 5,
        borderWidth: 2,
    },
    descriptionText: {
        height: 255,
        lineHeight: 23,
        paddingTop: 15,
        textAlignVertical: 'top',
    },
    mainButton: {
        borderRadius: 15,
        borderWidth: 2,
        height: 39,
        width: 83,
    },
    mainButtonText: { fontSize: 13, lineHeight: 23 },
    wrapperSpace: {
        height: 3,
        marginLeft: 11,
        width: 3,
    },
    wrapperSubText: {
        fontSize: 10,
    },
    wrapperText: {
        color: 'black',
        fontSize: 11,
        marginVertical: Platform.OS === 'android' ? 0 : 15,
    },
});

function convertStringToDay(startDate?: string, endDate?: string): Day {
    const day: Day = {};
    if (startDate) {
        day.startDate = startDate;
    }
    if (endDate) {
        day.endDate = endDate;
    }
    return day;
}

function toFundingAmountString(type: EnumProposalType, amount: string | null | undefined): string | undefined {
    if (type !== EnumProposalType.Business) {
        return undefined;
    }
    return StringToWeiAmount(amount).toString();
}

function fromFundingAmountString(fundingAmount: string | null | undefined): string | undefined {
    if (!fundingAmount) return undefined;
    return WeiAmountToString(BigNumber.from(fundingAmount), true);
}

function convertFundingAmount(amount: string): string {
    if (!amount || !IsValidAmountString(amount)) return amount;
    const fundingAmount = WeiAmountToString(StringToWeiAmount(amount), true);
    const dotIndex = fundingAmount.indexOf('.');
    if (amount.endsWith('.')) {
        return fundingAmount.slice(0, dotIndex + 1);
    }
    if (!amount.includes('.')) {
        return fundingAmount.slice(0, dotIndex);
    }
    return fundingAmount;
}

interface RowProps {
    label: string;
    subTitle?: string;
    mandatory?: boolean;
}

function RowWrapper(props: PropsWithChildren<RowProps>): JSX.Element {
    const { label, mandatory, subTitle, children } = props;
    const themeContext = useContext(ThemeContext);
    return (
        <View style={{ marginTop: 10 }}>
            <View style={globalStyle.flexRowBetween}>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text style={[globalStyle.mtext, styles.wrapperText]}>{label}</Text>
                    {mandatory && (
                        <View style={[styles.wrapperSpace, { backgroundColor: themeContext.color.disagree }]} />
                    )}
                </View>
                <Text style={[globalStyle.ltext, styles.wrapperSubText]}>{subTitle}</Text>
            </View>
            {children}
        </View>
    );
}

RowWrapper.defaultProps = {
    subTitle: undefined,
    mandatory: false,
};

function CreateProposal({ route, navigation }: MainScreenProps<'CreateProposal'>): JSX.Element {
    const { tempId } = route.params || {};
    const dispatch = useAppDispatch();
    const { user, isGuest, enrolled, metamaskStatus, metamaskAccount, metamaskConnect } = useContext(AuthContext);
    const { createProposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const [itemId, setItemId] = useState(tempId);
    const [proposalType, setProposalType] = useState(EnumProposalType.Business);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Day>({});
    const [logoImage, setLogoImage] = useState<ImagePickerResult>();
    const [mainImage, setMainImage] = useState<ImagePickerResult>();
    const [uploadFiles, setUploadFiles] = useState<DocumentResult[]>([]);
    const [amount, setAmount] = useState<string>();
    const [saveData, setSaveData] = useState<LocalStorageProposalProps>();
    const [createError, setCreateError] = useState<{ errorName: string } | undefined>();
    const [assets] = useAssets(iconAssets);
    const pickedDate = useAppSelector(selectDatePickerState);

    const [uploadAttachment] = useUploadFileMutation();

    const resetData = useCallback(() => {
        setItemId(undefined);
        setTitle('');
        setDescription('');
        setProposalType(EnumProposalType.Business);
        setLogoImage(undefined);
        setMainImage(undefined);
        setUploadFiles([]);
        setAmount(undefined);
        dispatch(resetDatePicker());
    }, [dispatch]);

    useEffect(() => {
        let cancel = false;
        const handler = async () => {
            if (tempId) {
                const proposalData = await LocalStorage.getTemporaryProposals(tempId);
                if (proposalData && !cancel) {
                    setItemId(tempId);
                    setTitle(proposalData.name || '');
                    setDescription(proposalData.description || '');
                    setProposalType((proposalData.type || EnumProposalType.Business) as EnumProposalType);
                    setAmount(fromFundingAmountString(proposalData.fundingAmount));
                    if (proposalData.startDate || proposalData.endDate) {
                        setDate(convertStringToDay(proposalData.startDate, proposalData.endDate));
                    }
                } else {
                    resetData();
                }
            } else {
                resetData();
            }
        };
        handler().catch(console.log);
        return () => {
            cancel = true;
        };
    }, [tempId, resetData]);

    const runCreateProposal = useCallback(
        async (_title: string, _description: string, _amount?: string) => {
            try {
                if (isGuest) {
                    dispatch(showSnackBar(getString('둘러보기 중에는 사용할 수 없습니다')));
                    return;
                }

                let uploadedLogoImageUrl;
                const uploadedAttachmentUrls: (string | undefined)[] = [];
                let uploadedFileUrl: (string | undefined)[] = [];

                if (!_title) setCreateError({ errorName: 'title' });
                else if (!date.startDate || !date.endDate) setCreateError({ errorName: 'date' });
                else if (!_description) setCreateError({ errorName: 'description' });

                if (!enrolled) setCreateError({ errorName: 'creator' });

                if (!_title || !date.startDate || !date.endDate || !_description) {
                    dispatch(showSnackBar(getString('필수 항목을 입력해주세요')));
                    return;
                }
                if (!enrolled) {
                    if (metamaskStatus === MetamaskStatus.OTHER_CHAIN) {
                        dispatch(showSnackBar(getString('메타마스크가 다른 네트워크에 연결되어 있습니다&#46;')));
                    } else {
                        dispatch(showSnackBar(getString('제안자의 노드 정보가 올바르지 않습니다')));
                    }
                    return;
                }

                // check valid range of boa
                if (proposalType === EnumProposalType.Business) {
                    if (!isValidFundAmount(_amount)) {
                        setCreateError({ errorName: 'fundingAmount' });
                        dispatch(showSnackBar(getString('요청금액 정보가 올바르지 않습니다')));
                        return;
                    }
                    if (!isValidBusinessVoteDate(date.startDate, date.endDate)) {
                        setCreateError({ errorName: 'date' });
                        dispatch(showSnackBar(getString('날짜 정보가 올바르지 않습니다')));
                        return;
                    }
                }

                dispatch(showLoadingAniModal());

                if (logoImage && !logoImage.cancelled) {
                    const result = await loadUriAsFile(logoImage?.uri);
                    if (result) {
                        const info = logoImage.exif?.name ? { name: logoImage.exif.name as string } : {};
                        const uploaded = await uploadAttachment({ variables: { file: result, info } });
                        if (uploaded?.data?.upload) {
                            uploadedLogoImageUrl = uploaded.data.upload.id;
                        }
                    }
                }

                if (mainImage && !mainImage.cancelled) {
                    const result = await loadUriAsFile(mainImage?.uri);
                    if (result) {
                        const info = mainImage.exif?.name ? { name: mainImage.exif.name as string } : {};
                        const uploaded = await uploadAttachment({ variables: { file: result, info } });
                        if (uploaded?.data?.upload) {
                            uploadedAttachmentUrls.push(uploaded.data.upload.id);
                        }
                    }
                }

                if (uploadFiles) {
                    const uploadFilePromises = uploadFiles
                        .filter((file) => file && file.type === 'success' && file.uri)
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

                const proposalData: ProposalInput = {
                    name: _title,
                    description: _description,
                    type: proposalType,
                    logo: uploadedLogoImageUrl,
                    attachment: uploadedAttachmentUrls.filter((uri) => !!uri) as string[],
                    fundingAmount: toFundingAmountString(proposalType, _amount),
                    // eslint-disable-next-line camelcase
                    proposer_address: user?.address,
                    creator: user?.memberId,
                    status:
                        proposalType === EnumProposalType.Business
                            ? EnumProposalStatus.PendingAssess
                            : EnumProposalStatus.Created,
                    votePeriod: {
                        begin: date.startDate,
                        end: date.endDate,
                    },
                };
                if (proposalType === EnumProposalType.Business) {
                    proposalData.assessPeriod = getDefaultAssessPeriod();
                }
                const proposalResponse = await createProposal(proposalData, {
                    where: proposalType === EnumProposalType.Business ? OpenWhere(metamaskAccount) : ProjectWhere,
                    sort: 'createdAt:desc',
                });
                /*
                if (proposalResponse.data?.createProposal?.proposal?.id) {
                    const pushData = await push.getCurrentPushLocalStorage();
                    await createFollow(
                        feedAddress,
                        [proposalResponse.data?.createProposal?.proposal?.id],
                        pushData?.id,
                        pushData?.enablePush,
                    ).catch(console.log);
                }
                */

                dispatch(hideLoadingAniModal());

                if (itemId) {
                    await LocalStorage.deleteTemporaryProposal(itemId);
                }
                resetData();
                if (!proposalResponse?.proposalId) {
                    if (navigation.canGoBack()) {
                        navigation.pop();
                    } else {
                        navigation.dispatch(replaceToHome());
                    }
                    return;
                }
                const { proposalId } = proposalResponse;
                navigation.replace('RootUser', { screen: 'ProposalPayment', params: { id: proposalId } });
            } catch (err) {
                console.log('CreateProposal error : ', err);
                dispatch(hideLoadingAniModal());
            }
        },
        [
            isGuest,
            date.startDate,
            date.endDate,
            enrolled,
            proposalType,
            dispatch,
            logoImage,
            mainImage,
            uploadFiles,
            user?.address,
            user?.memberId,
            createProposal,
            metamaskAccount,
            itemId,
            resetData,
            navigation,
            metamaskStatus,
            uploadAttachment,
        ],
    );

    const headerLeft = useCallback(() => {
        return (
            <Button
                onPress={() => {
                    resetData();
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
    }, [navigation, resetData]);

    const headerRight = useCallback(() => {
        if (metamaskStatus === MetamaskStatus.CONNECTING) {
            return (
                <View style={globalStyle.flexRowBetween}>
                    <ActivityIndicator />
                    <ShortButton
                        style={{ marginLeft: 12 }}
                        title={proposalType === EnumProposalType.System ? getString('등록') : getString('다음')}
                        titleStyle={styles.buttonTitle}
                        buttonStyle={styles.button}
                        disabled
                        disabledStyle={styles.buttonDisabled}
                    />
                </View>
            );
        }
        if (metamaskStatus === MetamaskStatus.NOT_CONNECTED) {
            return (
                <View style={globalStyle.flexRowBetween}>
                    <Button
                        containerStyle={[globalStyle.headerMetaButton, { backgroundColor: themeContext.color.primary }]}
                        title="CONNECT"
                        titleStyle={globalStyle.headerMetaTitle}
                        onPress={() => {
                            metamaskConnect();
                        }}
                    />
                    <ShortButton
                        style={{ marginLeft: 12 }}
                        title={proposalType === EnumProposalType.System ? getString('등록') : getString('다음')}
                        titleStyle={styles.buttonTitle}
                        buttonStyle={styles.button}
                        disabled
                        disabledStyle={styles.buttonDisabled}
                    />
                </View>
            );
        }
        return (
            <ShortButton
                title={proposalType === EnumProposalType.System ? getString('등록') : getString('다음')}
                titleStyle={styles.buttonTitle}
                buttonStyle={styles.button}
                onPress={() => {
                    runCreateProposal(title, description, amount).catch(console.log);
                }}
            />
        );
    }, [
        metamaskStatus,
        proposalType,
        runCreateProposal,
        title,
        description,
        amount,
        themeContext.color.primary,
        metamaskConnect,
    ]);

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
            title: getString('제안 작성'),
            headerTitleStyle: [globalStyle.headerTitle, { color: 'white' }],
            headerTitleAlign: 'center',
            headerLeft,
            headerRight,
            headerBackground,
            headerShown: true,
        });
    }, [headerBackground, headerLeft, headerRight, navigation]);

    useEffect(() => {
        setDate({
            startDate: pickedDate.startDate,
            endDate: pickedDate.endDate,
        });
    }, [pickedDate.startDate, pickedDate.endDate]);

    useEffect(() => {
        let cancel = false;
        if (saveData) {
            const handler = async () => {
                const addId = await LocalStorage.addTemporaryProposal(saveData);
                if (!cancel) {
                    setItemId(addId);
                    setSaveData(undefined);
                    dispatch(showSnackBar(getString('임시저장 되었습니다&#46;')));
                }
            };
            handler().catch((e) => {
                console.log('Temp proposal save error : ', e);
                dispatch(showSnackBar(getString('임시 저장시 오류 발생')));
            });
        }
        return () => {
            cancel = true;
        };
    }, [saveData, dispatch]);

    const showPreview = () => {
        const previewData: PreviewProposal = {
            name: title,
            description,
            type: proposalType,
            votePeriod: {
                begin: date.startDate,
                end: date.endDate,
            },
            fundingAmount: toFundingAmountString(proposalType, amount),
            logoImage,
            mainImage,
        };
        savePreviewToSession(previewData)
            .then(() => {
                navigation.push('RootUser', { screen: 'ProposalPreview' });
            })
            .catch(console.log);
    };

    const saveAsTemp = () => {
        const newTempProposalData: LocalStorageProposalProps = {
            name: title,
            description,
            type: proposalType.toString(),
            fundingAmount: toFundingAmountString(proposalType, amount),
            startDate: date?.startDate,
            endDate: date?.endDate,
            timestamp: Date.now(),
        };
        if (itemId) {
            newTempProposalData.id = itemId;
        }
        setSaveData(newTempProposalData);
    };

    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <KeyboardAwareScrollView style={{ flex: 1 }} enableResetScrollToCoords={false}>
                <View style={styles.container}>
                    <Text style={[globalStyle.ltext, { fontSize: 15, lineHeight: 23 }]}>
                        {getString(
                            `작성 완료된 제안은 수정이 불가능하므로\n아래의 제안 작성시 내용을 정확하게 등록해주세요&#46;`,
                        )}
                    </Text>
                    <RowWrapper label={getString('제안 유형')} mandatory>
                        <RadioButton
                            data={[{ label: getString('사업제안') }, { label: getString('시스템제안') }]}
                            selectedIndex={proposalType === EnumProposalType.Business ? 0 : 1}
                            onChange={(index: number) => {
                                const changedType = index === 0 ? EnumProposalType.Business : EnumProposalType.System;
                                if (changedType !== proposalType) {
                                    dispatch(resetDatePicker());
                                }
                                setProposalType(changedType);
                            }}
                            buttonDirection="row"
                            buttonStyle={{}}
                        />
                    </RowWrapper>

                    <RowWrapper
                        label={getString('제안 제목')}
                        mandatory
                        subTitle={`${title.length}/${TITLE_MAX_LENGTH}`}
                    >
                        <TextInputComponent
                            onChangeText={(text: string) => {
                                if (text.length > TITLE_MAX_LENGTH) {
                                    setTitle(text.slice(0, TITLE_MAX_LENGTH));
                                } else {
                                    setTitle(text);
                                }
                            }}
                            value={title}
                            // koreanInput
                            placeholder={getString('제안 제목을 입력해주세요&#46;')}
                            maxLength={TITLE_MAX_LENGTH}
                        />
                    </RowWrapper>
                    <RowWrapper label={getString('투표 기간')} mandatory>
                        <DatePicker
                            onNavigate={(param) => {
                                navigation.push('RootUser', {
                                    screen: 'Calendar',
                                    params: {
                                        isAssess: param.isAssess,
                                        startDate: param.startDate,
                                        endDate: param.endDate,
                                    },
                                });
                            }}
                            value={date}
                            title={getString('투표기간 선택')}
                            isAssess={proposalType === EnumProposalType.Business}
                        />
                    </RowWrapper>
                    {proposalType === EnumProposalType.Business && (
                        <RowWrapper label={getString('요청 금액')} mandatory>
                            <TextInputComponent
                                onChangeText={(text: string) => setAmount(convertFundingAmount(text))}
                                value={amount || ''}
                                placeholder={getString('요청할 BOA 수량을 입력해주세요&#46;')}
                                maxLength={TITLE_MAX_LENGTH}
                                subComponent={<Text>BOA</Text>}
                                keyboardType={Platform.select({ web: 'default', default: 'number-pad' })}
                            />
                            <View style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                                {IsValidAmountString(amount) ? (
                                    <Text style={globalStyle.rrtext}>
                                        {`${getString('수수료')} `}
                                        <Text style={{ color: themeContext.color.primary }}>
                                            {WeiAmountToString(calculateProposalFee(amount), true)}
                                        </Text>
                                        {` ${getString('BOA')}`}
                                    </Text>
                                ) : (
                                    <Text style={[globalStyle.rrtext, { color: themeContext.color.error }]}>
                                        {getString('숫자를 입력해주세요&#46;')}
                                    </Text>
                                )}
                            </View>
                        </RowWrapper>
                    )}
                    <RowWrapper label={getString('목표 및 설명')} mandatory>
                        <Input
                            value={description}
                            textAlignVertical="top"
                            placeholder={getString('제안의 목표 및 관련 내용을 입력해주세요')}
                            placeholderTextColor={themeContext.color.placeholder}
                            multiline
                            style={styles.descriptionText}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            inputStyle={[
                                globalStyle.rtext,
                                {
                                    fontSize: 14,
                                    color: themeContext.color.textBlack,
                                    outlineStyle: 'none',
                                },
                            ]}
                            containerStyle={styles.descriptionContainer}
                            onChangeText={(text: string) => setDescription(text)}
                            renderErrorMessage={false}
                            allowFontScaling={false}
                            autoCorrect={false}
                            autoCompleteType={undefined}
                        />
                    </RowWrapper>

                    <RowWrapper label={getString('로고 이미지')} subTitle={getString('이미지 파일 10MB이하로 등록')}>
                        <ImagePicker
                            showImage
                            onChangeImage={(image) => setLogoImage(image)}
                            value={logoImage}
                            placeholder={getString('로고 이미지를 등록해주세요')}
                        />
                    </RowWrapper>
                    <RowWrapper label={getString('대표 이미지')} subTitle={getString('이미지 파일 10MB이하로 등록')}>
                        <ImagePicker
                            showImage
                            onChangeImage={(image) => setMainImage(image)}
                            value={mainImage}
                            placeholder={getString('대표 이미지를 등록해주세요')}
                        />
                    </RowWrapper>

                    <RowWrapper
                        label={getString('자료 업로드')}
                        subTitle={getString('10M이하로, 5개까지의 pdf 파일 등록')}
                    >
                        <DocumentPicker
                            onChangeFiles={(files) => setUploadFiles(files)}
                            value={uploadFiles}
                            placeholder={getString('자료를 등록해주세요')}
                            fileType={['application/pdf']}
                        />
                    </RowWrapper>

                    <View style={{ marginTop: 37 }}>
                        <Text style={[globalStyle.ltext, { textAlign: 'center', lineHeight: 23 }]}>
                            {getString(`작성하신 제안을 등록하시기 전에 미리보기를 통해\n내용을 확인해주세요&#46;`)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <ShortButton
                            onPress={showPreview}
                            title={getString('미리보기')}
                            buttonStyle={[styles.mainButton, { backgroundColor: themeContext.color.primary }]}
                            titleStyle={styles.mainButtonText}
                            filled
                        />
                        <ShortButton
                            onPress={saveAsTemp}
                            title={getString('임시저장')}
                            containerStyle={{ marginLeft: 8 }}
                            buttonStyle={[styles.mainButton, { borderColor: themeContext.color.primary }]}
                            titleStyle={styles.mainButtonText}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </>
    );
}

export default CreateProposal;
