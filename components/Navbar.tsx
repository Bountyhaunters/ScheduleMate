import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="px-4 py-2 md:px-8 md:py-6">
      <div className="flex flex-row items-center justify-end">
        <ConnectButton />
      </div>
    </nav>
  );
}
