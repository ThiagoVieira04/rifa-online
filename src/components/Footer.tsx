import Link from "next/link"
import { HiTicket } from "react-icons/hi"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <HiTicket className="text-purple-400" size={24} />
              RifaOnline
            </div>
            <p className="text-zinc-400 text-sm">
              Plataforma gratuita de rifas e sorteios online. Justo, transparente e fácil de usar.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-zinc-400 hover:text-white transition-colors">Início</Link>
              <Link href="/dashboard" className="block text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/dashboard/raffles/new" className="block text-zinc-400 hover:text-white transition-colors">Criar Rifa</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contato</h3>
            <p className="text-zinc-400 text-sm">
              Dúvidas ou sugestões? Entre em contato pelo GitHub.
            </p>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-8 pt-6 text-center text-zinc-500 text-sm">
          &copy; {currentYear} RifaOnline. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
