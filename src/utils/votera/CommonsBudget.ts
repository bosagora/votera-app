/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/** Content Hash: 0x23b888d3cf482a2e53d1aaef1f3c48577cc48ed4468994d112628b31ace5e49b */
import { ethers } from 'ethers';

export class CommonsBudget extends ethers.Contract {
    constructor(addressOrName: string, providerOrSigner: ethers.Signer | ethers.providers.Provider) {
        super(addressOrName, new.target.ABI(), providerOrSigner);
    }

    connect(providerOrSigner: ethers.Signer | ethers.providers.Provider): CommonsBudget {
        return new (<{ new (...args: any[]): CommonsBudget }>this.constructor)(this.address, providerOrSigner);
    }

    attach(addressOrName: string): CommonsBudget {
        return new (<{ new (...args: any[]): CommonsBudget }>this.constructor)(
            addressOrName,
            this.signer || this.provider,
        );
    }

    allowFunding(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['allowFunding(bytes32)'](_proposalID, _overrides);
    }

    assessProposal(
        _proposalID: string | ethers.utils.BytesLike,
        _validatorSize: ethers.BigNumberish,
        _assessParticipantSize: ethers.BigNumberish,
        _assessData: Array<ethers.BigNumber>,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['assessProposal(bytes32,uint256,uint256,uint64[])'](
            _proposalID,
            _validatorSize,
            _assessParticipantSize,
            _assessData,
            _overrides,
        );
    }

    canDistributeVoteFees(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<boolean> {
        return this['canDistributeVoteFees(bytes32)'](_proposalID, _overrides);
    }

    changeVoteParam(
        _voteManager: string,
        _voteAddress: string,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['changeVoteParam(address,address)'](_voteManager, _voteAddress, _overrides);
    }

    checkWithdrawState(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<{ code: string; countingFinishTime: ethers.BigNumber }> {
        return this['checkWithdrawState(bytes32)'](_proposalID, _overrides);
    }

    createFundProposal(
        _proposalID: string | ethers.utils.BytesLike,
        _proposalInput: {
            start: ethers.BigNumberish;
            end: ethers.BigNumberish;
            startAssess: ethers.BigNumberish;
            endAssess: ethers.BigNumberish;
            amount: ethers.BigNumberish;
            docHash: string | ethers.utils.BytesLike;
            title: string;
        },
        _signature: string | ethers.utils.BytesLike,
        _overrides?: ethers.PayableOverrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['createFundProposal(bytes32,(uint64,uint64,uint64,uint64,uint256,bytes32,string),bytes)'](
            _proposalID,
            _proposalInput,
            _signature,
            _overrides,
        );
    }

    createSystemProposal(
        _proposalID: string | ethers.utils.BytesLike,
        _proposalInput: {
            start: ethers.BigNumberish;
            end: ethers.BigNumberish;
            startAssess: ethers.BigNumberish;
            endAssess: ethers.BigNumberish;
            amount: ethers.BigNumberish;
            docHash: string | ethers.utils.BytesLike;
            title: string;
        },
        _signature: string | ethers.utils.BytesLike,
        _overrides?: ethers.PayableOverrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['createSystemProposal(bytes32,(uint64,uint64,uint64,uint64,uint256,bytes32,string),bytes)'](
            _proposalID,
            _proposalInput,
            _signature,
            _overrides,
        );
    }

    distributeVoteFees(
        _proposalID: string | ethers.utils.BytesLike,
        _start: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['distributeVoteFees(bytes32,uint256)'](_proposalID, _start, _overrides);
    }

    finishVote(
        _proposalID: string | ethers.utils.BytesLike,
        _validatorSize: ethers.BigNumberish,
        _voteResult: Array<ethers.BigNumber>,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['finishVote(bytes32,uint256,uint64[])'](_proposalID, _validatorSize, _voteResult, _overrides);
    }

    getProposalData(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<{
        state: number;
        proposalType: number;
        proposalResult: number;
        proposer: string;
        title: string;
        countingFinishTime: ethers.BigNumber;
        fundingAllowed: boolean;
        fundWithdrawn: boolean;
        start: ethers.BigNumber;
        end: ethers.BigNumber;
        startAssess: ethers.BigNumber;
        endAssess: ethers.BigNumber;
        docHash: string;
        fundAmount: ethers.BigNumber;
        assessParticipantSize: ethers.BigNumber;
        assessData: Array<ethers.BigNumber>;
        validatorSize: ethers.BigNumber;
        voteResult: Array<ethers.BigNumber>;
        voteAddress: string;
    }> {
        return this['getProposalData(bytes32)'](_proposalID, _overrides);
    }

    getProposalValues(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<ethers.BigNumber> {
        return this['getProposalValues(bytes32)'](_proposalID, _overrides);
    }

    getStorageContractAddress(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['getStorageContractAddress()'](_overrides);
    }

    isManager(account: string, _overrides?: ethers.CallOverrides): Promise<boolean> {
        return this['isManager(address)'](account, _overrides);
    }

    isOwner(account: string, _overrides?: ethers.CallOverrides): Promise<boolean> {
        return this['isOwner(address)'](account, _overrides);
    }

    manager(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['manager()'](_overrides);
    }

    owner(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['owner()'](_overrides);
    }

    refuseFunding(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['refuseFunding(bytes32)'](_proposalID, _overrides);
    }

    renounceOwnership(_overrides?: ethers.Overrides): Promise<ethers.providers.TransactionResponse> {
        return this['renounceOwnership()'](_overrides);
    }

    setManager(newManager: string, _overrides?: ethers.Overrides): Promise<ethers.providers.TransactionResponse> {
        return this['setManager(address)'](newManager, _overrides);
    }

    supportsInterface(
        interfaceId: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<boolean> {
        return this['supportsInterface(bytes4)'](interfaceId, _overrides);
    }

    transferOwnership(newOwner: string, _overrides?: ethers.Overrides): Promise<ethers.providers.TransactionResponse> {
        return this['transferOwnership(address)'](newOwner, _overrides);
    }

    withdraw(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['withdraw(bytes32)'](_proposalID, _overrides);
    }

    static factory(signer?: ethers.Signer): ethers.ContractFactory {
        return new ethers.ContractFactory(CommonsBudget.ABI(), CommonsBudget.bytecode(), signer);
    }

    static bytecode(): string {
        return ethers.logger.throwError('no bytecode provided during generation', ethers.errors.UNSUPPORTED_OPERATION, {
            operation: 'contract.bytecode',
        });
    }

    static ABI(): Array<string> {
        return [
            'constructor()',
            'event AssessmentFinish(bytes32 proposalID, bool assessResult)',
            'event FundTransfer(bytes32 proposalID)',
            'event FundWithdrawAllow(bytes32 proposalID)',
            'event FundWithdrawRefuse(bytes32 proposalID)',
            'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
            'event Received(address, uint256)',
            'event VoteCountingFinish(bytes32 proposalID, bool countingResult)',
            'function allowFunding(bytes32 _proposalID)',
            'function assessProposal(bytes32 _proposalID, uint256 _validatorSize, uint256 _assessParticipantSize, uint64[] _assessData)',
            'function canDistributeVoteFees(bytes32 _proposalID) view returns (bool)',
            'function changeVoteParam(address _voteManager, address _voteAddress)',
            'function checkWithdrawState(bytes32 _proposalID) view returns (string code, uint256 countingFinishTime)',
            'function createFundProposal(bytes32 _proposalID, tuple(uint64 start, uint64 end, uint64 startAssess, uint64 endAssess, uint256 amount, bytes32 docHash, string title) _proposalInput, bytes _signature) payable',
            'function createSystemProposal(bytes32 _proposalID, tuple(uint64 start, uint64 end, uint64 startAssess, uint64 endAssess, uint256 amount, bytes32 docHash, string title) _proposalInput, bytes _signature) payable',
            'function distributeVoteFees(bytes32 _proposalID, uint256 _start)',
            'function finishVote(bytes32 _proposalID, uint256 _validatorSize, uint64[] _voteResult)',
            'function getProposalData(bytes32 _proposalID) view returns (tuple(uint8 state, uint8 proposalType, uint8 proposalResult, address proposer, string title, uint256 countingFinishTime, bool fundingAllowed, bool fundWithdrawn, uint64 start, uint64 end, uint64 startAssess, uint64 endAssess, bytes32 docHash, uint256 fundAmount, uint256 assessParticipantSize, uint64[] assessData, uint256 validatorSize, uint64[] voteResult, address voteAddress))',
            'function getProposalValues(bytes32 _proposalID) view returns (uint256)',
            'function getStorageContractAddress() view returns (address contractAddress)',
            'function isManager(address account) view returns (bool)',
            'function isOwner(address account) view returns (bool)',
            'function manager() view returns (address)',
            'function owner() view returns (address)',
            'function refuseFunding(bytes32 _proposalID)',
            'function renounceOwnership()',
            'function setManager(address newManager)',
            'function supportsInterface(bytes4 interfaceId) pure returns (bool)',
            'function transferOwnership(address newOwner)',
            'function withdraw(bytes32 _proposalID)',
        ];
    }
}

export default CommonsBudget;
