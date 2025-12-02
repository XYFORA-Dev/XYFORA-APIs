import Link from "next/link";

const Footer = () => {
    return (
        <div className="flex justify-center items-center py-5 bg-black">
            <h2 className="text-2xl text-center text-white">
                Powered By{" "}

                <Link
                    className="hover:text-cyan-500"
                    href="https://xyfora.se"
                    target="_blank"
                >
                    XYFORA
                </Link>
            </h2>
        </div>
    )
};

export default Footer;