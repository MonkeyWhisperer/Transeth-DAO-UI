import Web3EthContract from "web3-eth-contract";
import { ETHEREUM_NETWORK_TYPE, INodeDetails, INodeEndpoint, INodePub, NodeDetailManagerParams } from "./interfaces";
declare class NodeDetailManager {
    _currentEpoch: string;
    _torusNodeEndpoints: string[];
    _torusNodePub: INodePub[];
    _torusIndexes: number[];
    _network: ETHEREUM_NETWORK_TYPE;
    nodeListAddress: string;
    updated: boolean;
    nodeListContract: Web3EthContract.Contract;
    constructor({ network, proxyAddress }?: NodeDetailManagerParams);
    get _nodeDetails(): INodeDetails;
    getCurrentEpoch(): Promise<string>;
    getEpochInfo(epoch: string): Promise<{
        nodeList: string[];
    }>;
    getNodeEndpoint(nodeEthAddress: string): Promise<INodeEndpoint>;
    getNodeDetails(skip?: boolean, skipPostEpochCheck?: boolean): Promise<INodeDetails>;
}
export default NodeDetailManager;
