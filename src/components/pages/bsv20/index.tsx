import Tabs, { Tab } from "@/components/tabs";
import { useOrdinals } from "@/context/ordinals";
import { useWallet } from "@/context/wallet";
import { WithRouterProps } from "next/dist/client/with-router";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { FetchStatus } from "..";
import WalletTabs, { WalletTab } from "../wallet/tabs";

interface PageProps extends WithRouterProps {}

const Bsv20WalletPage: React.FC<PageProps> = ({}) => {
  const {
    payPk,
    ordPk,
    fetchBsv20sStatus,
    setFetchBsv20sStatus,
    bsv20Balances,
    bsv20Activity,
  } = useWallet();

  const { stats, fetchStatsStatus } = useOrdinals();
  const router = useRouter();
  const { page } = router.query as { page: string };
  const [lastSettled, setLastSettled] = useState<number | undefined>();
  const [showInvalid, setShowInvalid] = useState<boolean>(false);

  const activity = useMemo(() => {
    return bsv20Activity?.sort((a, b) => {
      // pending to the top
      if (a.valid === null && b.valid !== null) {
        return -1;
      }
      if (a.height! < b.height!) {
        return -1;
      }
      // same block, use index
      if (a.height === b.height) {
        return parseInt(a.idx) > parseInt(b.idx) ? -1 : 1;
      }
      return 1;
    });
  }, [bsv20Activity]);

  useEffect(() => {
    if (stats && stats.settled !== lastSettled) {
      // TODO: When indexer resets this is LOUD
      // crowl someone went back the beginning
      // as it flys through blocks with no matching txs
      // setFetchBsv20sStatus(FetchStatus.Idle);
      setLastSettled(stats.settled);
    }
  }, [lastSettled, stats]);

  const filteredActivity = useMemo(() => {
    if (!showInvalid) {
      return activity?.filter((a) => a.valid !== false);
    }
    return activity;
  }, [activity, showInvalid]);

  const pagination = useMemo(() => {
    return (
      <div className="text-center h-full flex items-center justify-center">
        <div className="flex items-center justify-between max-w-2xl">
          {parseInt(page || "1") > 1 && (
            <div className="">
              <button
                className="bg-[#111] rounded mb-8 text-sm p-2 md:p-4 my-4"
                onClick={() =>
                  router.push(`/bsv20/?page=${page ? parseInt(page) - 1 : 1}`)
                }
              >
                Prev
              </button>
            </div>
          )}
          <div className="bg-[#111] rounded flex items-center mb-8 max-w-2xl text-sm p-2 md:p-4 m-4">
            Page {parseInt(page || "1")}
          </div>
          <div className="">
            <button
              className="bg-[#111] rounded mb-8 text-sm p-2 md:p-4 my-4"
              onClick={() =>
                router.push(
                  page
                    ? `/bsv20/?page=${parseInt(page || "1") + 1}`
                    : "/bsv20/?page=2"
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }, [router, page]);

  return (
    <>
      <Head>
        <title>1SatOrdinals.com</title>
        <meta
          name="description"
          content="An Ordinals-compatible implementation on Bitcoin SV"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto+Slab&family=Ubuntu:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Tabs
        currentTab={Tab.Wallet}
        onClickSelected={() =>
          fetchBsv20sStatus === FetchStatus.Loading
            ? () => {}
            : setFetchBsv20sStatus(FetchStatus.Idle)
        }
        showIndicator={fetchBsv20sStatus !== FetchStatus.Loading}
      />
      <WalletTabs currentTab={WalletTab.BSV20} />

      <div className="p-4">
        {fetchBsv20sStatus !== FetchStatus.Loading && (!payPk || !ordPk) && (
          <div
            className="max-w-md rounded my-8 bg-[#222] hover:bg-[#333] cursor-pointer mx-auto p-4 md:p-8"
            onClick={() => Router.push("./wallet")}
          >
            You need a wallet first.
          </div>
        )}
        {fetchBsv20sStatus === FetchStatus.Success &&
          bsv20Balances?.length === 0 &&
          payPk &&
          ordPk && (
            <div className="max-w-md rounded bg-[#222] hover:bg-[#333] cursor-pointer mx-auto p-8 my-8">
              You, sadly, have no artifacts.
            </div>
          )}

        <div className={`${"mb-12"} mx-auto min-w-[300px]`}>
          {/* <div className="my-2 text-lg flex justify-between items-center">
            <div>BSV-20</div>
            <div className="flex items-center"></div>
          </div> */}

          <div className="flex flex-col md:flex-row">
            <div className="mb-4">
              <h1 className="text-lg mb-4">Balances</h1>
              <div className="grid grid-cols-2 gap-3 bg-[#222] p-4 rounded md:mr-4 mb-4">
                <div className="text-[#777] font-semibold">Ticker</div>
                <div className="text-[#777] font-semibold">Balance</div>
                {bsv20Balances &&
                  Object.entries(bsv20Balances).map(
                    ([ticker, balance], idx) => (
                      <React.Fragment key={`${ticker}-${idx}`}>
                        <div
                          className="cursor-pointer hover:text-blue-400 transition"
                          onClick={() => Router.push(`/market/bsv20/${ticker}`)}
                        >
                          {ticker}
                        </div>
                        <div className="text-emerald-400">{balance}</div>
                      </React.Fragment>
                    )
                  )}
              </div>
            </div>

            <div className="md:ml-4">
              <h1 className="text-lg mb-4 flex items-center justify-between">
                <div>Activity</div>
                <div className="text-sm text-[#555]">
                  <label className="cursor-pointer hover:text-[#777] transition">
                    Show Invalid{" "}
                    <input
                      checked={showInvalid}
                      type="checkbox"
                      className="ml-2 transition"
                      onChange={(e) => {
                        console.log({ cehcked: e.target.checked });
                        setShowInvalid(!showInvalid);
                      }}
                    />
                  </label>
                </div>
              </h1>
              <div className="my-2 w-full text-sm grid grid-cols-4 p-4 gap-x-4 gap-y-2">
                <div className="font-semibold text-[#777] text-base">
                  Ticker
                </div>
                <div className="font-semibold text-[#777] text-base">Op</div>
                <div className="font-semibold text-[#777] text-base">
                  Amount
                </div>
                <div className="font-semibold text-[#777] text-base text-right">
                  Valid
                </div>
                {filteredActivity?.map((bsv20, index) => (
                  <React.Fragment key={`${bsv20.tick}-${index}`}>
                    <div
                      className="flex items-center cursor-pointer hover:text-blue-400 transition"
                      onClick={() => Router.push(`/market/bsv20/${bsv20.tick}`)}
                    >
                      {bsv20.tick}
                    </div>
                    <div>{bsv20.op} </div>
                    <div>{bsv20.amt} </div>
                    <div className="text-right">
                      {bsv20.valid === null ? (
                        <a href={`https://whatsonchain.com/tx/${bsv20.txid}`}>
                          [-]
                        </a>
                      ) : bsv20.valid ? (
                        "[✓]"
                      ) : (
                        "[✗]"
                      )}
                    </div>
                    {bsv20.valid === false && (
                      <div className="text-red-500 col-span-4">
                        Reason: {bsv20.reason}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="max-w-md flex">{pagination}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bsv20WalletPage;
