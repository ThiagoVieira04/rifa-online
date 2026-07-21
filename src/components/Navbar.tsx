"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/AuthProvider"
import { HiMenu, HiX, HiTicket } from "react-icons/hi"

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <HiTicket className="text-purple-400" size={28} />
            RifaOnline
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
              Início
            </Link>
            {!loading && user ? (
              <>
                <Link href="/dashboard/raffles" className="text-zinc-300 hover:text-white transition-colors">
                  Minhas Rifas
                </Link>
                <Link href="/dashboard/raffles/new" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Criar Rifa
                </Link>
                <div className="relative ml-4 pl-4 border-l border-zinc-700">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    {user.image ? (
                      <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0) ?? "U"}
                      </div>
                    )}
                    <span className="text-sm">{user.name}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg py-2">
                      <div className="px-4 py-2 border-b border-zinc-700">
                        <p className="text-white text-sm font-medium truncate">{user.name}</p>
                        <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white text-sm transition-colors"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white text-sm transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setDropdownOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-zinc-400 hover:bg-zinc-700 hover:text-white text-sm transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !loading ? (
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Entrar
              </Link>
            ) : null}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-zinc-800 border-t border-zinc-700 px-4 py-4 space-y-3">
          <Link href="/" className="block text-zinc-300 hover:text-white" onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          {!loading && user ? (
            <>
              <Link href="/dashboard/raffles" className="block text-zinc-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                Minhas Rifas
              </Link>
              <Link href="/dashboard/raffles/new" className="block text-zinc-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                Criar Rifa
              </Link>
              <Link href="/profile" className="block text-zinc-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                Perfil
              </Link>
              <Link href="/dashboard" className="block text-zinc-300 hover:text-white" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
                className="text-zinc-400 hover:text-white text-sm"
              >
                Sair
              </button>
            </>
          ) : !loading ? (
            <Link href="/login" className="block text-purple-400 hover:text-purple-300" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
          ) : null}
        </div>
      )}
    </nav>
  )
}
