import { Contract, providers, Wallet, BigNumber, utils } from 'ethers';

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// token0がusdc
const LP_ADDRESS = '0x2cF7252e74036d1Da831d11089D326296e64a728';
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

const swapBalance = BigNumber.from(1).mul(
  BigNumber.from(10).pow(USDC_DECIMALS)
);

const lp = new Contract(LP_ADDRESS, [
  'function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data)',
]).connect(signer);

const main = async () => {
  const receipt1 = await usdc.functions.approve(LP_ADDRESS, swapBalance, {
    gasPrice: (await provider.getGasPrice()).add(10),
  });
  console.log(receipt1);
  await receipt1.wait();

  const receipt2 = await lp.functions.swap(
    0,
    BigNumber.from(8).mul(BigNumber.from(10).pow(USDT_DECIMALS - 1)),
    signer.address,
    utils.formatBytes32String('')
    // {
    //   gasPrice: await provider.getGasPrice(),
    // }
  );
  console.log(receipt2);
  await receipt2.wait();
};

main().catch((err) => {
  console.error(err);
});
