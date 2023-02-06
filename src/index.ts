import { Contract, providers, Wallet, BigNumber, utils } from 'ethers';

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

// token0がusdc
const ROUTER_ADDRESS = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
const RPC_URL = 'https://polygon-rpc.com';

const USDC_DECIMALS = 6;
const USDT_DECIMALS = 6;

const privateKey = process.env.PRIVATE_KEY;
if (privateKey == null) throw new Error('not found privateKey');

const provider = new providers.JsonRpcProvider(RPC_URL);
const signer = new Wallet(privateKey, provider);

const usdc = new Contract(USDC_ADDRESS, [
  'function approve(address spender, uint256 amount) external returns (bool)',
]).connect(signer);

const swapIn = BigNumber.from(10).mul(
  BigNumber.from(10).pow(USDC_DECIMALS - 1)
);

const swapOut = BigNumber.from(0).mul(
  BigNumber.from(10).pow(USDT_DECIMALS - 1)
);

const router = new Contract(ROUTER_ADDRESS, [
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
]).connect(signer);

const main = async () => {
  const receipt1 = await usdc.functions.approve(ROUTER_ADDRESS, swapIn, {
    gasPrice: (await provider.getGasPrice()).add(10),
  });
  console.log(receipt1);
  await receipt1.wait();

  const receipt2 = await router.functions.swapExactTokensForTokens(
    swapIn,
    swapOut,
    [USDC_ADDRESS, USDT_ADDRESS],
    signer.address,
    Date.now() + 60 * 2,
    {
      gasPrice: (await provider.getGasPrice()).add(10),
    }
  );
  console.log(receipt2);
  await receipt2.wait();
};

main().catch((err) => {
  console.error(err);
});
