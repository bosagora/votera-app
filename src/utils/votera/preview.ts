import { ImageInfo } from 'expo-image-picker';
import { PreviewProposal } from '~/types/proposalType';
import SessionStorage from '~/utils/SessionStorage';
import { Enum_Proposal_Type as EnumProposalType } from '~/graphql/generated/generated';

const PREVIEW_KEY = 'preview.key';

interface PreviewSessionData {
    name: string | undefined;
    description: string | undefined;
    type: string | undefined;
    votePeriod: { begin: string | undefined; end: string | undefined };
    fundingAmount: string | undefined;
    logoImage: ImageInfo | undefined;
    mainImage: ImageInfo | undefined;
}

export async function savePreviewToSession(previewData: PreviewProposal): Promise<void> {
    const sessionData: PreviewSessionData = {
        name: previewData.name,
        description: previewData.description,
        type: previewData.type.toString(),
        votePeriod: {
            begin: previewData.votePeriod?.begin,
            end: previewData.votePeriod?.end,
        },
        fundingAmount: previewData.fundingAmount,
        logoImage: previewData.logoImage && !previewData.logoImage.cancelled ? previewData.logoImage : undefined,
        mainImage: previewData.mainImage && !previewData.mainImage.cancelled ? previewData.mainImage : undefined,
    };
    await SessionStorage.setSessionByKey(PREVIEW_KEY, sessionData);
}

export async function loadPreviewFromSession(): Promise<PreviewProposal> {
    const sessionData = await SessionStorage.getSessionByKey<PreviewSessionData>(PREVIEW_KEY);
    return {
        name: sessionData?.name || '',
        description: sessionData?.description || '',
        type: (sessionData?.type || EnumProposalType.Business) as EnumProposalType,
        votePeriod: sessionData?.votePeriod || undefined,
        fundingAmount: sessionData?.fundingAmount,
        logoImage: sessionData?.logoImage,
        mainImage: sessionData?.mainImage,
    };
}
