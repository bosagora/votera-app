/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BigNumber } from 'ethers';
import { commify, formatEther, parseEther } from 'ethers/lib/utils';
import { getFundProposalFeePermil } from './agoraconf';
import getString from '../locales/STRINGS';

export enum VOTE_SELECT {
    BLANK,
    YES,
    NO,
}

export function WeiAmountToString(amount: BigNumber | undefined | null, comma = false): string {
    if (!amount) return '0';
    const value = formatEther(amount);
    return comma ? commify(value) : value;
}

export function RoundDecimalPoint(amount: string, unit: number): string {
    const index = amount.lastIndexOf('.');
    if (index < 0 || unit < 0) {
        return amount;
    }
    const decimalUnit = amount.length - index - 1;
    if (decimalUnit <= unit) {
        return amount;
    }
    return unit === 0 ? amount.slice(0, index) : amount.slice(0, index + 1 + unit);
}

export function StringToWeiAmount(amount: string | null | undefined): BigNumber {
    if (!amount || amount === '') return BigNumber.from(0);
    return parseEther(amount.replace(/,/g, ''));
}

export function StringWeiAmountFormat(amount: string | null | undefined): string {
    if (!amount) return '0';
    return WeiAmountToString(BigNumber.from(amount), true);
}

const reDigit = /^\d[\d,]*(\.\d*)?$/;

export function IsValidAmountString(amount: string | null | undefined): boolean {
    if (!amount) return true;
    return reDigit.test(amount);
}

export function calculateProposalFee(_amount: string | null | undefined): BigNumber {
    if (!IsValidAmountString(_amount)) return BigNumber.from(0);
    const amount = StringToWeiAmount(_amount);
    const ratio = getFundProposalFeePermil();
    return amount.mul(ratio).div(BigNumber.from(1000));
}

// hardhat node VM
const ERROR_MSG = `Error: VM Exception while processing transaction: reverted with reason string '`;

export function getRevertMessage(error: any): string {
    if (error.reason && (typeof error.reason === 'string' || error.reason instanceof String)) {
        const reason = error.reason.valueOf() as string;
        if (reason.startsWith(ERROR_MSG) && reason.endsWith("'")) {
            return reason.slice(ERROR_MSG.length, -1);
        }
    } else if (
        error.data?.message &&
        (typeof error.data.message === 'string' || error.data.message instanceof String)
    ) {
        const message = error.data.message.valueOf() as string;
        if (message.startsWith('err: insufficient funds for')) {
            return 'insufficient funds for';
        }
    }
    return '';
}

export function convertCreateRevertMessage(revertMsg: string) {
    switch (revertMsg) {
        case 'AlreadyExistProposal':
            return getString('이미 생성된 제안입니다&#46;');
        case 'InvalidFee':
            return getString('수수료를 잘못 입력했습니다&#46;');
        case 'NotEnoughBudget':
            return getString('contract의 예산 잔액이 부족합니다&#46;');
        case 'NotAuthorized':
            return getString('권한이 없습니다&#46;');
        case 'InvalidInput':
            return getString('잘못 입력된 값이 있습니다&#46;');
        case 'NotReady':
            return getString('현재 contract이 준비되지 않았습니다&#46;');
        case 'E000':
            return getString('권한이 없습니다&#46;');
        case 'E001':
            return getString('잘못 입력된 값이 있습니다&#46;');
        case 'insufficient funds for':
            return getString('잔액이 부족해 실행하지 못했습니다&#46;');
        default:
            return getString('제안 생성 중 알 수 없는 오류가 발생했습니다&#46;');
    }
}

export function convertWithdrawRevertMessage(revertMsg: string) {
    switch (revertMsg) {
        case 'W00':
            return getString('정상적으로 자금을 인출할 수 있습니다&#46;');
        case 'W01':
            return getString('제안서가 존재하지 않습니다&#46;');
        case 'W02':
            return getString('제안서가 사업제안이 아닙니다&#46;');
        case 'W03':
            return getString('사전평가에서 거부되었습니다&#46;');
        case 'W04':
            return getString('개표가 완료되지 않았습니다&#46;');
        case 'W05':
            return getString('제안자의 요청이 아닙니다&#46;');
        case 'W06':
            return getString('제안이 정족수 부족으로 무효화되거나 찬성표 부족으로 부결되었습니다&#46;');
        case 'W07':
            return getString('개표종료시간으로 부터 24시간이 지나지 않았습니다&#46;');
        case 'W08':
            return getString('거부권이 행사되었습니다&#46;');
        case 'W09':
            return getString('펀딩자금이 이미 지급되었습니다&#46;');
        case 'W10':
            return getString('예산이 요청된 자금보다 작습니다&#46;');
        default:
            return getString('자금인출 시 알 수 없는 오류가 발생헀습니다&#46;');
    }
}
