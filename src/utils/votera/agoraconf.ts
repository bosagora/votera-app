import { Platform } from 'react-native';
import { BigNumber } from 'ethers';
import { httpLinkURI, httpServerURI } from '../../../config/ServerConfig';
import { Agora, FeePolicyPayload } from '~/graphql/generated/generated';
import { getLocale } from '~/utils/locales/STRINGS';
import { StringToWeiAmount } from './voterautil';

let privacyTermUrl = `${httpLinkURI || ''}/privacy.html`;
let privacyTermKoUrl = privacyTermUrl;
let userServiceTermUrl = `${httpLinkURI || ''}/userService.html`;
let userServiceTermKoUrl = userServiceTermUrl;
let proposalFundMin = BigNumber.from(0);
let proposalFundMax: BigNumber | undefined;
let fundProposalFeePermil = BigNumber.from(1);
let systemProposalFee = BigNumber.from('100000000000000000000');
let voterFee = BigNumber.from('400000000000000');
let withdrawDelayPeriod = 86400;
let boaScanUrl = '';
let agoraScanUrl = '';
let commonsBudgetAddress = '';

function normalizeUrl(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${Platform.OS === 'web' ? window.location.origin : httpServerURI || ''}${url}`;
}

export function setAgoraConf(
    agora:
        | Pick<
              Agora,
              | 'privacyTermUrl'
              | 'userServiceTermUrl'
              | 'proposalFundMin'
              | 'proposalFundMax'
              | 'commonsBudgetAddress'
              | 'voteraVoteAddress'
              | 'providerUrl'
              | 'boaScanUrl'
              | 'agoraScanUrl'
              | 'userServiceTermKoUrl'
              | 'privacyTermKoUrl'
          >
        | undefined,
) {
    if (!agora) {
        return;
    }

    if (agora.privacyTermUrl) {
        privacyTermUrl = normalizeUrl(agora.privacyTermUrl);
    }
    if (agora.privacyTermKoUrl) {
        privacyTermKoUrl = normalizeUrl(agora.privacyTermKoUrl);
    } else {
        privacyTermKoUrl = privacyTermUrl;
    }
    if (agora.userServiceTermUrl) {
        userServiceTermUrl = normalizeUrl(agora.userServiceTermUrl);
    }
    if (agora.userServiceTermKoUrl) {
        userServiceTermKoUrl = normalizeUrl(agora.userServiceTermKoUrl);
    } else {
        userServiceTermKoUrl = userServiceTermUrl;
    }
    if (agora.proposalFundMin || agora.proposalFundMax) {
        let fundMin = proposalFundMin;
        let fundMax = proposalFundMax;

        if (agora.proposalFundMin) {
            fundMin = BigNumber.from(agora.proposalFundMin);
            if (fundMin.lt(BigNumber.from(0))) {
                fundMin = proposalFundMin;
            } else if (proposalFundMax && fundMin.gt(proposalFundMax)) {
                fundMin = proposalFundMin;
            }
        }
        if (agora.proposalFundMax) {
            fundMax = BigNumber.from(agora.proposalFundMax);
            if (fundMax.lt(fundMin)) {
                fundMax = proposalFundMax;
            }
        }

        proposalFundMax = fundMax;
        proposalFundMin = fundMin;
    }
    if (agora.boaScanUrl) {
        boaScanUrl = agora.boaScanUrl;
    }
    if (agora.agoraScanUrl) {
        agoraScanUrl = agora.agoraScanUrl;
    }
    if (agora.commonsBudgetAddress) {
        commonsBudgetAddress = agora.commonsBudgetAddress;
    }
}

export function getPrivacyTermURL() {
    if (getLocale().startsWith('ko')) {
        return privacyTermKoUrl;
    }
    return privacyTermUrl;
}

export function getUserServiceTermURL() {
    if (getLocale().startsWith('ko')) {
        return userServiceTermKoUrl;
    }
    return userServiceTermUrl;
}

export function getBoaScanUrl(address: string): string {
    return `${boaScanUrl}/${address}`;
}

export function getAgoraScanUrl(publicKey: string): string {
    return `${agoraScanUrl}/${publicKey}`;
}

export function isValidFundAmount(_amount: string | undefined | null): boolean {
    if (!_amount) return false;
    const amount = StringToWeiAmount(_amount);
    if (amount.lt(proposalFundMin)) return false;
    if (proposalFundMax && amount.gt(proposalFundMax)) return false;
    return true;
}

export function getFundProposalFeePermil(): BigNumber {
    return fundProposalFeePermil;
}

export function getSystemProposalFee(): BigNumber {
    return systemProposalFee;
}

export function getVoterFee(): BigNumber {
    return voterFee;
}

export function getWithdrawDelayPeriod(): number {
    return withdrawDelayPeriod;
}

export function setFeePolicy(feePolicy: FeePolicyPayload) {
    if (feePolicy.fundProposalFeePermil) {
        fundProposalFeePermil = BigNumber.from(feePolicy.fundProposalFeePermil);
    }
    if (feePolicy.systemProposalFee) {
        systemProposalFee = BigNumber.from(feePolicy.systemProposalFee);
    }
    if (feePolicy.voterFee) {
        voterFee = BigNumber.from(feePolicy.voterFee);
    }
    if (feePolicy.withdrawDelayPeriod) {
        withdrawDelayPeriod = feePolicy.withdrawDelayPeriod;
    }
}

export function getCommonsBudgetAddress(): string {
    return commonsBudgetAddress;
}
