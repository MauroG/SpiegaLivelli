import React from "react";
import { Level } from "../types";
import { GraduationCap, Award, Compass, Sparkles } from "lucide-react";

interface LevelSelectorProps {
  currentLevel: Level;
  onLevelChange: (level: Level) => void;
  disabled?: boolean;
}

export default function LevelSelector({ currentLevel, onLevelChange, disabled = false }: LevelSelectorProps) {
  const levels = [
    {
      id: "biennio" as Level,
      name: "BIENNIO",
      ageRange: "14-16 anni",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      activeStyle: "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm",
      inactiveStyle: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300",
      icon: Compass,
      description: "Concetti semplici, analogie quotidiane, zero tecnicismi ostici.",
      indicatorColor: "bg-emerald-500"
    },
    {
      id: "triennio" as Level,
      name: "TRIENNIO",
      ageRange: "16-18 anni",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      activeStyle: "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-sm",
      inactiveStyle: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300",
      icon: GraduationCap,
      description: "Lessico disciplinare, congiunzioni teoriche, contesti reali.",
      indicatorColor: "bg-amber-500"
    },
    {
      id: "maturita" as Level,
      name: "MATURITÀ",
      ageRange: "18-19 anni",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      activeStyle: "border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20 shadow-sm",
      inactiveStyle: "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300",
      icon: Award,
      description: "Linguaggio specialistico, fonti critiche, connessioni filosofico-sociali.",
      indicatorColor: "bg-rose-500"
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <label className="text-sm font-semibold tracking-tight text-gray-800 flex items-center gap-1.5 font-display">
          <Sparkles className="w-4 h-4 text-amber-600" />
          SCEGLI IL TUO LIVELLO ATTIVO
        </label>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          Livello corrente: <strong>{currentLevel.toUpperCase()}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((lvl) => {
          const IconComponent = lvl.icon;
          const isActive = currentLevel === lvl.id;
          return (
            <button
              id={`level-btn-${lvl.id}`}
              key={lvl.id}
              onClick={() => !disabled && onLevelChange(lvl.id)}
              disabled={disabled}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 ${
                isActive ? lvl.activeStyle : lvl.inactiveStyle
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? lvl.badgeColor : 'bg-gray-100 text-gray-500'}`}>
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-bold tracking-wider text-xs font-display">
                    {lvl.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                  {lvl.ageRange}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                {lvl.description}
              </p>
              {isActive && (
                <div className="w-full mt-2.5 h-1 rounded-full relative overflow-hidden bg-gray-200">
                  <div className={`absolute top-0 left-0 h-full w-full ${lvl.indicatorColor}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
