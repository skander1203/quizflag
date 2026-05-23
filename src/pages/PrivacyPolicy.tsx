import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useSounds } from '../hooks/useSounds';

export function PrivacyPolicy() {
  const navigate = useNavigate();
  const { withClick } = useSounds();

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="shrink-0 pb-3">
        <button
          type="button"
          onClick={withClick(() => navigate(-1))}
          className="flex items-center gap-1.5 text-white/60 text-sm font-semibold min-h-[48px] px-1 tap-target"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour
        </button>
      </header>

      <motion.article
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden glass-card border border-white/20 p-5 sm:p-6 mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Politique de Confidentialité - QuizFlag
        </h1>
        <p className="text-white/50 text-xs font-semibold mt-1 mb-5">
          Dernière mise à jour : Mai 2025
        </p>

        <section className="space-y-4 text-sm text-white/85">
          <div>
            <h2 className="text-base font-extrabold text-white mb-2">
              1. Collecte des données
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-semibold text-white/75">
              <li>Email et pseudo lors de l&apos;inscription</li>
              <li>Scores et statistiques de jeu</li>
              <li>Aucune donnée de localisation collectée</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-white mb-2">
              2. Utilisation des données
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-semibold text-white/75">
              <li>Affichage dans le classement</li>
              <li>Statistiques personnelles</li>
              <li>Aucune vente à des tiers</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-white mb-2">
              3. Stockage
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-semibold text-white/75">
              <li>Données stockées sur Supabase (serveurs européens)</li>
              <li>Mot de passe chiffré et sécurisé</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-white mb-2">
              4. Vos droits
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-semibold text-white/75">
              <li>Droit de suppression de compte sur demande</li>
              <li>
                Contact :{' '}
                <a
                  href="mailto:skanderbenaissa13@gmail.com"
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                >
                  skanderbenaissa13@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-white mb-2">
              5. Cookies
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 font-semibold text-white/75">
              <li>Aucun cookie publicitaire</li>
              <li>Session locale uniquement</li>
            </ul>
          </div>
        </section>
      </motion.article>
    </div>
  );
}
