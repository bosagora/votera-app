import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Icon, Text } from 'react-native-elements';
import { debounce } from 'lodash';
import TextInputComponent from '~/components/input/SingleLineInput2';
import { useCheckUsernameLazyQuery } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

const DEBOUNCER_TIME = 300;

interface NameScreenProps {
    onChangeName: (accountName: string, incomplete?: boolean) => void;
}

function NameScreen(props: NameScreenProps): JSX.Element {
    const { onChangeName } = props;
    const themeContext = useContext(ThemeContext);
    const [accountName, setAccountName] = useState('');
    const [nameError, setNameError] = useState(false);

    const [checkUsername, { loading }] = useCheckUsernameLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (!data.checkDupUserName) {
                setNameError(true);
                onChangeName(accountName, true);
            } else if (data.checkDupUserName.duplicated) {
                setNameError(true);
                onChangeName(data.checkDupUserName.username || '', true);
            } else {
                setNameError(false);
                onChangeName(data.checkDupUserName.username || '', false);
            }
        },
        onError: (err) => {
            setNameError(true);
            onChangeName(accountName, true);
        },
    });

    const debounceNameCheck = useMemo(
        () =>
            debounce((username: string) => {
                if (username.length > 0) {
                    checkUsername({
                        variables: {
                            username,
                        },
                    }).catch(console.log);
                } else {
                    onChangeName('', true);
                }
            }, DEBOUNCER_TIME),
        [checkUsername, onChangeName],
    );

    useEffect(() => {
        return () => {
            debounceNameCheck.cancel();
        };
    }, [debounceNameCheck]);

    const checkAccountName = (text: string) => {
        setAccountName(text);
        setNameError(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        debounceNameCheck(text);
    };

    return (
        <>
            <Text style={{ lineHeight: 23, marginTop: 40 }}>
                {getString(`계정명을 입력해주세요!\n계정명은 언제든지 변경할 수 있습니다&#46;`)}
            </Text>
            <TextInputComponent
                style={{ marginTop: 32 }}
                inputStyle={{ color: themeContext.color.primary }}
                value={accountName}
                onChangeText={checkAccountName}
                subComponent={
                    accountName.length ? (
                        <Icon
                            onPress={() => setAccountName('')}
                            name="cancel"
                            color={themeContext.color.primary}
                            size={28}
                            tvParallaxProperties={undefined}
                        />
                    ) : undefined
                }
                placeholderText={getString('계정명을 입력해주세요')}
                searchValue=""
            />
            {nameError && (
                <Text style={{ color: themeContext.color.error, textAlign: 'center', lineHeight: 23, marginTop: 20 }}>
                    {getString('중복된 아이디입니다&#46; 다른 아이디를 입력해주십시오&#46;')}
                </Text>
            )}
            {loading && (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator size="large" />
                </View>
            )}
        </>
    );
}

export default NameScreen;
