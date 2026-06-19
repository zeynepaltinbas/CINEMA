"use client"

interface SignUpProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignIn: () => void;
}

export default function SignUp({ isOpen, onClose, onSwitchToSignIn }: SignUpProps) {
    if (!isOpen) 
        return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#1e293b] border border-[#2d3f55] rounded-2xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm font-bold transition-colors cursor-pointer select-none"
                >
                    ✕
                </button>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6">
                    Create Account
                </h2>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                Name
                            </label>
                            <input
                                type="text"
                                placeholder="John"
                                className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                Surname
                            </label>
                            <input
                                type="text"
                                placeholder="Doe"
                                className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            Birth Date
                        </label>
                        <input
                            type="date"
                            className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-400 transition-colors scheme-dark cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="example@mail.com"
                            className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="********"
                            className="w-full bg-[#0f172a] border border-[#2d3f55] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 transition-colors"
                        />
                    </div>

                    <div className="pt-4 space-y-2">
                        <button
                            type="submit"
                            className="w-full bg-[#d11c7f] hover:bg-[#b01368] active:scale-[0.99] text-white text-xs sm:text-sm font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#d11c7f]/10"
                        >
                            Sign up
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-[#2d3f55]/60 hover:bg-[#2d3f55] text-slate-300 text-xs sm:text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400 border-t border-[#2d3f55] pt-4">
                    Already have an account?{" "}
                    <button 
                        type="button"
                        onClick={() => { onClose(); onSwitchToSignIn() }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                        Sign in
                    </button>
                </div>

            </div>
        </div>
    )
}