/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/** Content Hash: 0xcf8868356e44c4fe28eb3fcd3fdf677e28f07a314f43c5b134aa0ea3e837e06e */
import { ethers } from 'ethers';

export class VoteraVote extends ethers.Contract {
    constructor(addressOrName: string, providerOrSigner: ethers.Signer | ethers.providers.Provider) {
        super(addressOrName, new.target.ABI(), providerOrSigner);
    }

    connect(providerOrSigner: ethers.Signer | ethers.providers.Provider): VoteraVote {
        return new (<{ new (...args: any[]): VoteraVote }>this.constructor)(this.address, providerOrSigner);
    }

    attach(addressOrName: string): VoteraVote {
        return new (<{ new (...args: any[]): VoteraVote }>this.constructor)(
            addressOrName,
            this.signer || this.provider,
        );
    }

    ASSESS_ITEM_SIZE(_overrides?: ethers.CallOverrides): Promise<ethers.BigNumber> {
        return this['ASSESS_ITEM_SIZE()'](_overrides);
    }

    addValidators(
        _proposalID: string | ethers.utils.BytesLike,
        _validators: Array<string>,
        _finalized: boolean,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['addValidators(bytes32,address[],bool)'](_proposalID, _validators, _finalized, _overrides);
    }

    changeCommonBudgetContract(
        _commonsBudgetAddress: string,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['changeCommonBudgetContract(address)'](_commonsBudgetAddress, _overrides);
    }

    commonsBudgetAddress(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['commonsBudgetAddress()'](_overrides);
    }

    countAssess(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['countAssess(bytes32)'](_proposalID, _overrides);
    }

    countVote(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['countVote(bytes32)'](_proposalID, _overrides);
    }

    getAssessAt(
        _proposalID: string | ethers.utils.BytesLike,
        _index: ethers.BigNumberish,
        _overrides?: ethers.CallOverrides,
    ): Promise<string> {
        return this['getAssessAt(bytes32,uint256)'](_proposalID, _index, _overrides);
    }

    getAssessCount(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<ethers.BigNumber> {
        return this['getAssessCount(bytes32)'](_proposalID, _overrides);
    }

    getAssessResult(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<Array<ethers.BigNumber>> {
        return this['getAssessResult(bytes32)'](_proposalID, _overrides);
    }

    getBallot(
        _proposalID: string | ethers.utils.BytesLike,
        _validator: string,
        _overrides?: ethers.CallOverrides,
    ): Promise<{ key: string; choice: number; nonce: ethers.BigNumber; commitment: string }> {
        return this['getBallot(bytes32,address)'](_proposalID, _validator, _overrides);
    }

    getBallotAt(
        _proposalID: string | ethers.utils.BytesLike,
        _index: ethers.BigNumberish,
        _overrides?: ethers.CallOverrides,
    ): Promise<string> {
        return this['getBallotAt(bytes32,uint256)'](_proposalID, _index, _overrides);
    }

    getBallotCount(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<ethers.BigNumber> {
        return this['getBallotCount(bytes32)'](_proposalID, _overrides);
    }

    getManager(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['getManager()'](_overrides);
    }

    getValidatorAt(
        _proposalID: string | ethers.utils.BytesLike,
        _index: ethers.BigNumberish,
        _overrides?: ethers.CallOverrides,
    ): Promise<string> {
        return this['getValidatorAt(bytes32,uint256)'](_proposalID, _index, _overrides);
    }

    getValidatorCount(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<ethers.BigNumber> {
        return this['getValidatorCount(bytes32)'](_proposalID, _overrides);
    }

    getVoteResult(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<Array<ethers.BigNumber>> {
        return this['getVoteResult(bytes32)'](_proposalID, _overrides);
    }

    init(
        _proposalID: string | ethers.utils.BytesLike,
        _useAssess: boolean,
        _startVote: ethers.BigNumberish,
        _endVote: ethers.BigNumberish,
        _startAssess: ethers.BigNumberish,
        _endAssess: ethers.BigNumberish,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['init(bytes32,bool,uint64,uint64,uint64,uint64)'](
            _proposalID,
            _useAssess,
            _startVote,
            _endVote,
            _startAssess,
            _endAssess,
            _overrides,
        );
    }

    isContainAssess(
        _proposalId: string | ethers.utils.BytesLike,
        _address: string,
        _overrides?: ethers.CallOverrides,
    ): Promise<boolean> {
        return this['isContainAssess(bytes32,address)'](_proposalId, _address, _overrides);
    }

    isContainBallot(
        _proposalID: string | ethers.utils.BytesLike,
        _address: string,
        _overrides?: ethers.CallOverrides,
    ): Promise<boolean> {
        return this['isContainBallot(bytes32,address)'](_proposalID, _address, _overrides);
    }

    isContainValidator(
        _proposalID: string | ethers.utils.BytesLike,
        _address: string,
        _overrides?: ethers.CallOverrides,
    ): Promise<boolean> {
        return this['isContainValidator(bytes32,address)'](_proposalID, _address, _overrides);
    }

    isValidatorListFinalized(
        _proposalID: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<boolean> {
        return this['isValidatorListFinalized(bytes32)'](_proposalID, _overrides);
    }

    owner(_overrides?: ethers.CallOverrides): Promise<string> {
        return this['owner()'](_overrides);
    }

    renounceOwnership(_overrides?: ethers.Overrides): Promise<ethers.providers.TransactionResponse> {
        return this['renounceOwnership()'](_overrides);
    }

    revealBallot(
        _proposalID: string | ethers.utils.BytesLike,
        _validators: Array<string>,
        _choices: Array<number>,
        _nonces: Array<ethers.BigNumber>,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['revealBallot(bytes32,address[],uint8[],uint256[])'](
            _proposalID,
            _validators,
            _choices,
            _nonces,
            _overrides,
        );
    }

    setupVoteInfo(
        _proposalID: string | ethers.utils.BytesLike,
        _startVote: ethers.BigNumberish,
        _endVote: ethers.BigNumberish,
        _openVote: ethers.BigNumberish,
        _info: string,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['setupVoteInfo(bytes32,uint64,uint64,uint64,string)'](
            _proposalID,
            _startVote,
            _endVote,
            _openVote,
            _info,
            _overrides,
        );
    }

    submitAssess(
        _proposalID: string | ethers.utils.BytesLike,
        _assess: Array<ethers.BigNumber>,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['submitAssess(bytes32,uint64[])'](_proposalID, _assess, _overrides);
    }

    submitBallot(
        _proposalID: string | ethers.utils.BytesLike,
        _commitment: string | ethers.utils.BytesLike,
        _signature: string | ethers.utils.BytesLike,
        _overrides?: ethers.Overrides,
    ): Promise<ethers.providers.TransactionResponse> {
        return this['submitBallot(bytes32,bytes32,bytes)'](_proposalID, _commitment, _signature, _overrides);
    }

    transferOwnership(newOwner: string, _overrides?: ethers.Overrides): Promise<ethers.providers.TransactionResponse> {
        return this['transferOwnership(address)'](newOwner, _overrides);
    }

    voteInfos(
        p0: string | ethers.utils.BytesLike,
        _overrides?: ethers.CallOverrides,
    ): Promise<{
        state: number;
        useAssess: boolean;
        commonsBudgetAddress: string;
        startAssess: ethers.BigNumber;
        endAssess: ethers.BigNumber;
        startVote: ethers.BigNumber;
        endVote: ethers.BigNumber;
        openVote: ethers.BigNumber;
        info: string;
    }> {
        return this['voteInfos(bytes32)'](p0, _overrides);
    }

    static factory(signer?: ethers.Signer): ethers.ContractFactory {
        return new ethers.ContractFactory(VoteraVote.ABI(), VoteraVote.bytecode(), signer);
    }

    static bytecode(): string {
        return ethers.logger.throwError('no bytecode provided during generation', ethers.errors.UNSUPPORTED_OPERATION, {
            operation: 'contract.bytecode',
        });
    }

    static ABI(): Array<string> {
        return [
            'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
            'event VoteResultPublished(bytes32 _proposalID)',
            'function ASSESS_ITEM_SIZE() view returns (uint256)',
            'function addValidators(bytes32 _proposalID, address[] _validators, bool _finalized)',
            'function changeCommonBudgetContract(address _commonsBudgetAddress)',
            'function commonsBudgetAddress() view returns (address)',
            'function countAssess(bytes32 _proposalID)',
            'function countVote(bytes32 _proposalID)',
            'function getAssessAt(bytes32 _proposalID, uint256 _index) view returns (address)',
            'function getAssessCount(bytes32 _proposalID) view returns (uint256)',
            'function getAssessResult(bytes32 _proposalID) view returns (uint64[])',
            'function getBallot(bytes32 _proposalID, address _validator) view returns (tuple(address key, uint8 choice, uint256 nonce, bytes32 commitment))',
            'function getBallotAt(bytes32 _proposalID, uint256 _index) view returns (address)',
            'function getBallotCount(bytes32 _proposalID) view returns (uint256)',
            'function getManager() view returns (address)',
            'function getValidatorAt(bytes32 _proposalID, uint256 _index) view returns (address)',
            'function getValidatorCount(bytes32 _proposalID) view returns (uint256)',
            'function getVoteResult(bytes32 _proposalID) view returns (uint64[])',
            'function init(bytes32 _proposalID, bool _useAssess, uint64 _startVote, uint64 _endVote, uint64 _startAssess, uint64 _endAssess)',
            'function isContainAssess(bytes32 _proposalId, address _address) view returns (bool)',
            'function isContainBallot(bytes32 _proposalID, address _address) view returns (bool)',
            'function isContainValidator(bytes32 _proposalID, address _address) view returns (bool)',
            'function isValidatorListFinalized(bytes32 _proposalID) view returns (bool)',
            'function owner() view returns (address)',
            'function renounceOwnership()',
            'function revealBallot(bytes32 _proposalID, address[] _validators, uint8[] _choices, uint256[] _nonces)',
            'function setupVoteInfo(bytes32 _proposalID, uint64 _startVote, uint64 _endVote, uint64 _openVote, string _info)',
            'function submitAssess(bytes32 _proposalID, uint64[] _assess)',
            'function submitBallot(bytes32 _proposalID, bytes32 _commitment, bytes _signature)',
            'function transferOwnership(address newOwner)',
            'function voteInfos(bytes32) view returns (uint8 state, bool useAssess, address commonsBudgetAddress, uint64 startAssess, uint64 endAssess, uint64 startVote, uint64 endVote, uint64 openVote, string info)',
        ];
    }
}

export default VoteraVote;
