import Footer from "@/components/Footer";
import Main from "@/components/Main";

const App = () => {
    return (
        <div className="flex flex-col justify-between">
            <div className="bg-[#ebe6e6] text-zinc-500 font-medium">
                <Main />
            </div>
            <Footer />
        </div>
    )

};

export default App;