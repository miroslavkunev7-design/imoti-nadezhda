import { cardStyle, PageHeader } from '@/components/admin/AdminCard'

import ConnectionStatus from '@/components/admin/ConnectionStatus'

import MilenaConfigPanel from '@/components/admin/MilenaConfigPanel'

import SettingsHub from '@/components/admin/SettingsHub'



export default function SettingsPage() {

  return (

    <div>

      <PageHeader title="Настройки" />

      <div id="status">

        <ConnectionStatus />

      </div>

      <div id="milena">

        <MilenaConfigPanel />

      </div>

      <SettingsHub />



      <div className="mt-5 rounded-xl p-6" style={cardStyle}>

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div>

            <h2 className="font-display text-white font-semibold mb-1">Имоти Надежда</h2>

            <p className="text-[rgba(255,255,255,0.4)] text-sm">

              Официален домейн:{' '}

              <a href="https://imotinadezhda.bg" className="text-crimson-400 hover:underline">

                imotinadezhda.bg

              </a>

            </p>

          </div>

          <div className="flex gap-3 items-center">

            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-xs text-white">Системата работи нормално</span>

          </div>

        </div>

      </div>

    </div>

  )

}

