/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/** Content Hash: 0x7d153336acfcf556728ef570de4640079cfd9fe659601a4b279f36da862d89c3 */
import { ethers } from 'ethers';

export class CommonsStorage extends ethers.Contract {
    constructor(addressOrName: string, providerOrSigner: ethers.Signer | ethers.providers.Provider) {
        super(addressOrName, new.target.ABI(), providerOrSigner);
    }

    connect(providerOrSigner: ethers.Signer | ethers.providers.Provider): CommonsStorage {
        return new (<{ new (...args: any[]): CommonsStorage }>this.constructor)(this.address, providerOrSigner);
    }

    attach(addressOrName: string): CommonsStorage {
        return new (<{ new (...args: any[]): CommonsStorage }>this.constructor)(
            addressOrName,
            this.signer || this.provider,
        );
    }

    approvalDiffPercent(_overrides?: ethers.CallOverrides): Promise<ethers.BigNumber> {
        return this['approvalDiffPercent()'](_overrides);
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

    changeVoteParam(
        _voteManager: string,
        _voteAddress: string,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['changeVoteParam(address,address)'](_voteManager, _voteAddress, _overrides);
    }

    checkWithdrawState(
        _proposalID: string | ethers.utils.BytesLike,
        requestAddress: string,
        _overrides?: ethers.CallOverrides,
    ): Promise<string> {
        return this['checkWithdrawState(bytes32,address)'](_proposalID, requestAddress, _overrides);
    }

    createFundProposal(
        _proposalID: string | ethers.utils.BytesLike,
        proposer: string,
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
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['createFundProposal(bytes32,address,(uint64,uint64,uint64,uint64,uint256,bytes32,string),bytes)'](
            _proposalID,
            proposer,
            _proposalInput,
            _signature,
            _overrides,
        );
    }

    createSystemProposal(
        _proposalID: string | ethers.utils.BytesLike,
        proposer: string,
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
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['createSystemProposal(bytes32,address,(uint64,uint64,uint64,uint64,uint256,bytes32,string),bytes)'](
            _proposalID,
            proposer,
            _proposalInput,
            _signature,
            _overrides,
        );
    }

    finishVote(
        _proposalID: string | ethers.utils.BytesLike,
        _validatorSize: ethers.BigNumberish,
        _voteResult: Array<ethers.BigNumber>,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['finishVote(bytes32,uint256,uint64[])'](_proposalID, _validatorSize, _voteResult, _overrides);
    }

    fundProposalFeePermil(_overrides?: ethers.CallOverrides): Promise<number> {
        return this['fundProposalFeePermil()'](_overrides);
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

    maxVoteFee(_overrides?: ethers.CallOverrides): Promise<ethers.BigNumber> {
        return this['maxVoteFee()'](_overrides);
    }

    setFundProposalFeePermil(
        _value: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setFundProposalFeePermil(uint32)'](_value, _overrides);
    }

    setFundingAllowed(
        _proposalID: string | ethers.utils.BytesLike,
        allow: boolean,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setFundingAllowed(bytes32,bool)'](_proposalID, allow, _overrides);
    }

    setSystemProposalFee(
        _value: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setSystemProposalFee(uint256)'](_value, _overrides);
    }

    setVoteQuorumFactor(
        _value: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setVoteQuorumFactor(uint32)'](_value, _overrides);
    }

    setVoterFee(
        _value: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setVoterFee(uint256)'](_value, _overrides);
    }

    setWithdrawDelayPeriod(
        _value: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setWithdrawDelayPeriod(uint32)'](_value, _overrides);
    }

    setWithdrawn(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setWithdrawn(bytes32)'](_proposalID, _overrides);
    }

    systemProposalFee(_overrides?: ethers.CallOverrides): Promise<ethers.BigNumber> {
        return this['systemProposalFee()'](_overrides);
    }

    transferOwnership(newOwner: string, _overrides?: ethers.Overrides): Promise<ethers.providers.TransactionResponse> {
        return this['transferOwnership(address)'](newOwner, _overrides);
    }

    voteAddress(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['voteAddress()'](_overrides);
    }

    voteFeeDistribCount(_overrides?: ethers.CallOverrides): Promise<ethers.BigNumber> {
        return this['voteFeeDistribCount()'](_overrides);
    }

    voteManager(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['voteManager()'](_overrides);
    }

    voteQuorumFactor(_overrides?: ethers.CallOverrides): Promise<number> {
        return this['voteQuorumFactor()'](_overrides);
    }

    voterFee(_overrides?: ethers.CallOverrides): Promise<ethers.BigNumber> {
        return this['voterFee()'](_overrides);
    }

    withdrawDelayPeriod(_overrides?: ethers.CallOverrides): Promise<number> {
        return this['withdrawDelayPeriod()'](_overrides);
    }

    static factory(signer?: ethers.Signer): ethers.ContractFactory {
        return new ethers.ContractFactory(CommonsStorage.ABI(), CommonsStorage.bytecode(), signer);
    }

    static bytecode(): string {
        return ethers.logger.throwError('no bytecode provided during generation', ethers.errors.UNSUPPORTED_OPERATION, {
            operation: 'contract.bytecode',
        });
    }

    static ABI(): Array<string> {
        return [
            'constructor(address _owner, address _budgetAddress)',
            'function approvalDiffPercent() view returns (uint256)',
            'function assessProposal(bytes32 _proposalID, uint256 _validatorSize, uint256 _assessParticipantSize, uint64[] _assessData) returns (bool)',
            'function changeVoteParam(address _voteManager, address _voteAddress)',
            'function checkWithdrawState(bytes32 _proposalID, address requestAddress) view returns (string code)',
            'function createFundProposal(bytes32 _proposalID, address proposer, tuple(uint64 start, uint64 end, uint64 startAssess, uint64 endAssess, uint256 amount, bytes32 docHash, string title) _proposalInput, bytes _signature)',
            'function createSystemProposal(bytes32 _proposalID, address proposer, tuple(uint64 start, uint64 end, uint64 startAssess, uint64 endAssess, uint256 amount, bytes32 docHash, string title) _proposalInput, bytes _signature)',
            'function finishVote(bytes32 _proposalID, uint256 _validatorSize, uint64[] _voteResult) returns (bool)',
            'function fundProposalFeePermil() view returns (uint32)',
            'function getProposalData(bytes32 _proposalID) view returns (tuple(uint8 state, uint8 proposalType, uint8 proposalResult, address proposer, string title, uint256 countingFinishTime, bool fundingAllowed, bool fundWithdrawn, uint64 start, uint64 end, uint64 startAssess, uint64 endAssess, bytes32 docHash, uint256 fundAmount, uint256 assessParticipantSize, uint64[] assessData, uint256 validatorSize, uint64[] voteResult, address voteAddress))',
            'function maxVoteFee() view returns (uint256)',
            'function setFundProposalFeePermil(uint32 _value)',
            'function setFundingAllowed(bytes32 _proposalID, bool allow)',
            'function setSystemProposalFee(uint256 _value)',
            'function setVoteQuorumFactor(uint32 _value)',
            'function setVoterFee(uint256 _value)',
            'function setWithdrawDelayPeriod(uint32 _value)',
            'function setWithdrawn(bytes32 _proposalID)',
            'function systemProposalFee() view returns (uint256)',
            'function transferOwnership(address newOwner)',
            'function voteAddress() view returns (address)',
            'function voteFeeDistribCount() view returns (uint256)',
            'function voteManager() view returns (address)',
            'function voteQuorumFactor() view returns (uint32)',
            'function voterFee() view returns (uint256)',
            'function withdrawDelayPeriod() view returns (uint32)',
        ];
    }
}

export default CommonsStorage;
