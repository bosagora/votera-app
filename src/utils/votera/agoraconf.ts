import { Platform } from 'react-native';
import { BigNumber } from 'ethers';
import { httpLinkURI, httpServerURI } from '../../../config/ServerConfig';
import { Agora, FeePolicyPayload } from '~/graphql/generated/generated';
import { StringToWeiAmount } from './voterautil';

let privacyTermUrl = `${httpLinkURI || ''}/privacy.html`;
let userServiceTermUrl = `${httpLinkURI || ''}/userService.html`;
let proposalFundMin = BigNumber.from(0);
let proposalFundMax: BigNumber | undefined;
let fundProposalFeePermil = BigNumber.from(1);
let systemProposalFee = BigNumber.from('100000000000000000000');
let voterFee = BigNumber.from('400000000000000');
let withdrawDelayPeriod = 86400;
let blockExplorerUrl = '';

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
              | 'blockExplorerUrl'
          >
        | undefined,
) {
    if (!agora) {
        return;
    }

    if (agora.privacyTermUrl) {
        if (agora.privacyTermUrl.startsWith('http://') || agora.privacyTermUrl.startsWith('https://')) {
            privacyTermUrl = agora.privacyTermUrl;
        } else {
            privacyTermUrl = `${Platform.OS === 'web' ? window.location.origin : httpServerURI || ''}${
                agora.privacyTermUrl
            }`;
        }
    }
    if (agora.userServiceTermUrl) {
        if (agora.userServiceTermUrl.startsWith('http://') || agora.userServiceTermUrl.startsWith('https://')) {
            userServiceTermUrl = agora.userServiceTermUrl;
        } else {
            userServiceTermUrl = `${Platform.OS === 'web' ? window.location.origin : httpServerURI || ''}${
                agora.userServiceTermUrl
            }`;
        }
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
    if (agora.blockExplorerUrl) {
        blockExplorerUrl = agora.blockExplorerUrl;
    }
}

export function getPrivacyTermURL() {
    return privacyTermUrl;
}

export function getUserServiceTermURL() {
    return userServiceTermUrl;
}

export function getBlockExplorerUrl(address: string): string {
    return `${blockExplorerUrl}/${address}`;
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
