
export = ipld_ethereum;
import {IPLDFormat} from "ipld"

declare const ipld_ethereum: {
    ethAccountSnapshot:IPLDFormat<Object>;
    ethBlock:IPLDFormat<Object>;
    ethBlockList:IPLDFormat<Object>;
    ethStateTrie:IPLDFormat<Object>;
    ethStorageTrie:IPLDFormat<Object>;
    ethTx:IPLDFormat<Object>;
    ethTxTrie:IPLDFormat<Object>;
};

