import { TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import * as Web3 from '@solana/web3.js';
import * as BS from 'bs58';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
    message: string
}

const CHAIN_URL = 'https://api.mainnet-beta.solana.com';
const DEV_URL = Web3.clusterApiUrl('mainnet-beta');
const MAIN_URL = Web3.clusterApiUrl('devnet');
const PRIORITY_RATE = 100;

console.log("URLS: ", DEV_URL, MAIN_URL);

const connection = new Web3.Connection(CHAIN_URL);

const toPubkey = new Web3.PublicKey("SX1Byb1pUCP6vWwBDd2bXhd82yY5L2TfMnrdjdr7Ao9");

type FormattedTransaction = {
    token0: string;
    token1: string;

}

async function getTokensBalances(walletPublicKey: Web3.PublicKey): Promise<any[]> {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map((account) => {
        return account.account.data.parsed;
    });;
}

function getAccount(): Web3.Keypair | null {
    const key = process.env["WALLET_PV_KEY"] ?? '';

    console.log("Key: " + key);

    const pvKey = new Uint8Array(BS.default.decode(key));

    return Web3.Keypair.fromSecretKey(pvKey);
}

function getPriorityFee(): Web3.TransactionInstruction {
    return Web3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_RATE });
}

async function transfer(to: string, amount: number) {
    const account = getAccount();

    if (!account) return;

    const transaction = new Web3.Transaction().add(
        Web3.SystemProgram.transfer({
            fromPubkey: account.publicKey,
            toPubkey: toPubkey,
            lamports: Web3.LAMPORTS_PER_SOL * amount,
        })
    );

    const signature = await Web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [account]
    );

}

Web3.clusterApiUrl('mainnet-beta');

const formatTransaction = (transaction: Web3.VersionedTransactionResponse): any => {
    const instructions = transaction.meta?.innerInstructions;
    const { message } = transaction.transaction;

    if (!instructions) return null;

    const data: any = {};

    for (const instruction of instructions) {
        const programId = message.staticAccountKeys[instruction.index];
        console.log(`Program ID: ${programId.toBase58()}`);

        // Analisar os dados da instrução, como accounts e data
        const tokenInstructions = instructions.filter(
            (instruction) => programId.equals(TOKEN_PROGRAM_ID)
        );

        console.log('tokenInstructions:', tokenInstructions);
    }

    return {
        ...transaction,
        signature: transaction.transaction.signatures.at(0)
    };
}

const getTransactions = async (publicKey: Web3.PublicKey) => {
    try {
        const transactions: any[] = [];
        const signatures = await connection.getSignaturesForAddress(publicKey);
        const transactionDetails = await Promise.all(
            signatures.map(async (sig) =>
                connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0, commitment: 'finalized' })

            ));

        return transactionDetails
            .filter(value => value !== null)
            .map((value) => formatTransaction(value))

    } catch (error) {
        console.error(error);
    }
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {



    res.status(200).json({});

}