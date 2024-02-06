"use client";

import Link from "next/link";

export const BasicNavbar = () => {
  return (
    <nav className="flex items-center justify-between pl-4 bg-transparent text-indigo-500">
      <Link href="/" className="text-2xl font-semibold" onDragStart={(e) => e.preventDefault()}>
        {/* <Image fill alt="Logo" src="images/logo2.svg" /> */}
        MyEMR
      </Link>
      <div className="flex items-center gap-x-2"></div>
    </nav>
  );
};
