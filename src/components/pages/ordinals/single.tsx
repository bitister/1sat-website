import Artifact from "@/components/artifact";
import OrdAddress from "@/components/ordAddress";
import { API_HOST, OrdUtxo } from "@/context/ordinals";
import { useWallet } from "@/context/wallet";
import { head } from "lodash";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { toastErrorProps } from "..";

type OrdinalProps = {
  artifact: OrdUtxo;
};

const Ordinal: React.FC<OrdinalProps> = ({ artifact }) => {
  const { ordAddress, ordUtxos, transfer } = useWallet();

  useEffect(() => console.log({ artifact }), [artifact]);

  const isBsv20 = useMemo(() => {
    if (artifact) {
      if (
        (head(artifact.file!.type.split(";")) === "text/plain" &&
          (artifact.height || 0) > 793000) ||
        head(artifact.file!.type.split(";")) === "application/bsv-20"
      ) {
        return true;
      }
      return;
    } else {
      return false;
    }
  }, [artifact]);

  useEffect(() => {
    console.log({ isBsv20 });
  }, [isBsv20]);

  const adminControls = useMemo(() => {
    return (
      artifact && (
        <div className="md:mt-0 mt-8 w-full">
          {ordAddress && <OrdAddress className="mb-4" />}
          {isBsv20 === undefined ||
            (!isBsv20 && (
              <div className="bg-[#111] rounded max-w-2xl break-words text-sm p-4 flex flex-col">
                <div className="flex justify-between items-center">
                  <div>Transfer Ownership</div>
                  <div
                    className="rounded bg-[#222] cursor-pointer p-2 hover:bg-[#333] transition text-white"
                    onClick={async () => {
                      console.log("click send");
                      const address = prompt(
                        "Enter the Bitcoin address to send this ordinal to. MAKE SURE THE WALLET ADDRESS YOU'RE SENDNG TO UNDERSTANDS ORDINALS, AND EXPECTS TORECIEVE 1SAT ORDINALS AT THIS ADDRESS!"
                      );

                      if (address) {
                        console.log("transferring", { artifact }, "to", {
                          address,
                        });

                        try {
                          // TODO: Send ordUtxo instead of artifact
                          await transfer(artifact, address);
                        } catch (e) {
                          toast.error(
                            "Something went wrong" + e,
                            toastErrorProps
                          );
                        }
                      }
                    }}
                  >
                    Send
                  </div>
                </div>

                {/* <div className="flex justify-between items-center mt-4">
                  <div>List for Sale</div>
                  <div
                    className="rounded bg-[#222] cursor-pointer p-2 hover:bg-[#333] transition text-white"
                    onClick={async () => {
                      Router.push(
                        `/market/new/${artifact.txid}_${artifact.vout}`
                      );
                    }}
                  >
                    List
                  </div>
                </div> */}

                {/* <div className="flex justify-between items-center mt-4">
        <div>Re-Inscribe</div>
        <div className="rounded bg-[#111] p-2" onClick={async () => {}}>
          SoonTm
        </div>
      </div> */}
              </div>
            ))}
        </div>
      )
    );
  }, [ordAddress, isBsv20, artifact, transfer]);

  return (
    <div className="flex md:flex-row flex-col justify-between items-start w-full">
      <Artifact
        to={artifact && artifact.num ? `/inscription/${artifact.num}` : "#"}
        origin={artifact ? `${artifact.txid}_${artifact.vout}` : undefined}
        src={
          artifact
            ? `${API_HOST}/api/files/inscriptions/${artifact.origin}`
            : ""
        }
        num={artifact?.num}
        contentType={artifact?.file?.type}
        height={artifact?.height}
      />
      <div className="ml-0 md:ml-4 w-full max-w-sm">{adminControls}</div>
    </div>
  );
};

export default Ordinal;
