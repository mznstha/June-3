import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Search, 
  Users, 
  TrendingUp, 
  Layers, 
  PhoneCall, 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  Settings, 
  Navigation, 
  Compass, 
  Sliders, 
  Briefcase, 
  AlertCircle,
  Clock,
  CircleDot,
  Check,
  XCircle,
  HelpCircle,
  Activity
} from "lucide-react";
import { PROGRAMMATIC_CITIES_METADATA, CitySEOPage } from "../config/landingPages";

interface CityBranchHubProps {
  onOpenQuote: (service?: string) => void;
  onTriggerLog: (log: any) => void;
  quotes: any[];
}

interface LocalCrew {
  id: string;
  name: string;
  role: string;
  status: "standby" | "active" | "dispatched";
  certs: string[];
  rating: number;
}

export default function CityBranchHub({ onOpenQuote, onTriggerLog, quotes }: CityBranchHubProps) {
  // Select active city key
  const [selectedCityKey, setSelectedCityKey] = useState<string>("perth");
  const [searchPostcode, setSearchPostcode] = useState("");
  const [searchError, setSearchError] = useState("");
  
  // Local branch settings / mutations state
  const [branchRates, setBranchRates] = useState<Record<string, number>>(() => {
    const rates: Record<string, number> = {};
    Object.entries(PROGRAMMATIC_CITIES_METADATA).forEach(([key, value]) => {
      rates[key] = value.hourlyRate;
    });
    return rates;
  });

  // Coverage zones state (toggle active status of specific suburbs)
  const [disabledSuburbs, setDisabledSuburbs] = useState<Record<string, string[]>>({});

  // Local localized crew rosters state
  const [localCrews, setLocalCrews] = useState<Record<string, LocalCrew[]>>({
    perth: [
      { id: "crew_p_1", name: "Connor Graham", role: "Solar Treatment Supervisor", status: "standby", certs: ["Class-H HEPA", "Solar-Care"], rating: 4.9 },
      { id: "crew_p_2", name: "Sienna Vance", role: "Lead Steriliser Technician", status: "active", certs: ["NDIS Specialist", "Bio-decon"], rating: 5.0 },
      { id: "crew_p_3", name: "Brodie Marshall", role: "WHS Field Inspector", status: "dispatched", certs: ["Advanced WHS", "Silica Safe"], rating: 4.8 }
    ],
    sydney: [
      { id: "crew_s_1", name: "Alisha Patel", role: "Lease Handover Specialist", status: "active", certs: ["Deposit Guard Specialist", "High-Steam Extractions"], rating: 4.9 },
      { id: "crew_s_2", name: "Marcus Stone", role: "Hazard Mitigation Engineer", status: "standby", certs: ["WHS Gold Shield", "HEPA Containment"], rating: 4.7 },
      { id: "crew_s_3", name: "Niamh O'Connor", role: "Primary Care Coordinator", status: "dispatched", certs: ["Aptitude Registered NDIS", "First Aid L3"], rating: 5.0 }
    ],
    melbourne: [
      { id: "crew_m_1", name: "Ethan Gallagher", role: "Crystalline Dust Expert", status: "active", certs: ["Class-H HEPA", "Silica Safety Lead"], rating: 4.8 },
      { id: "crew_m_2", name: "Chloe Henderson", role: "Aged Care Liaison Officer", status: "standby", certs: ["NDIS Provider", "Dementia Care Specialisation"], rating: 4.9 }
    ],
    brisbane: [
      { id: "crew_b_1", name: "Liam Vance", role: "Commercial Plant Coordinator", status: "standby", certs: ["Triple-Frequency Radiation Clean", "Commercial Lead"], rating: 4.9 },
      { id: "crew_b_2", name: "Owen Fletcher", role: "Renewable Array Specialist", status: "active", certs: ["Dual Solar UV De-scaler", "Industrial Safety"], rating: 4.6 }
    ],
    adelaide: [
      { id: "crew_a_1", name: "Thomas Brooks", role: "Clinical Sanitisation Officer", status: "active", certs: ["NDIS Standard Care", "Clinical Pathogen Cleanser"], rating: 4.9 },
      { id: "crew_a_2", name: "Freya McDonald", role: "Decontamination Evaluator", status: "standby", certs: ["Class-H HEPA Filter", "Eco-Hydra Chemistry"], rating: 4.8 }
    ]
  });

  // Forms for adding new crew
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Sanitation Specialist");
  const [newCrewCert, setNewCrewCert] = useState("");
  
  // Target city metadata
  const cityData: CitySEOPage = PROGRAMMATIC_CITIES_METADATA[selectedCityKey] || PROGRAMMATIC_CITIES_METADATA.perth;

  // Search postcode to change city branch page
  const handlePostcodeLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const cleaned = searchPostcode.trim();
    if (!cleaned) return;

    // Scan all programmatic cities to find a matching postcode
    let foundCityKey: string | null = null;
    let matchedSuburb = "";

    Object.entries(PROGRAMMATIC_CITIES_METADATA).forEach(([key, meta]) => {
      const idx = meta.postcodes.indexOf(cleaned);
      if (idx !== -1) {
        foundCityKey = key;
        matchedSuburb = meta.suburbs[idx];
      }
    });

    if (foundCityKey) {
      setSelectedCityKey(foundCityKey);
      onTriggerLog({
        id: `branch_lookup_success_${Date.now()}`,
        type: "system",
        status: "success",
        message: `🧭 Regional Hub Router: Postcode ${cleaned} successfully identified under "${PROGRAMMATIC_CITIES_METADATA[foundCityKey].city}" coverage network. Suburb mapped: ${matchedSuburb}.`,
        timestamp: new Date().toLocaleTimeString()
      });
      setSearchPostcode("");
    } else {
      setSearchError(`Postcode ${cleaned} is outside our current digital city networks. Try checking 2000 (Sydney), 3000 (Melbourne), 4000 (Brisbane), 6000 (Perth), or 5000 (Adelaide).`);
      onTriggerLog({
        id: `branch_lookup_fail_${Date.now()}`,
        type: "system",
        status: "warning",
        message: `⚠️ Regional Hub Warning: User searched postcode "${cleaned}" which was not mapped back to an active city branch network.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Dispatch a simulated crew
  const [dispatchLogs, setDispatchLogs] = useState<Array<{ id: string; msg: string; time: string; type: "info" | "success" | "warn" }>>([]);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleSimulateDispatch = (crewId: string) => {
    const crewsList = localCrews[selectedCityKey] || [];
    const crew = crewsList.find(c => c.id === crewId);
    if (!crew) return;

    if (crew.status === "dispatched") {
      alert(`${crew.name} is already dispatched to an active site!`);
      return;
    }

    setIsDispatching(true);
    // Move status to dispatched
    setLocalCrews(prev => {
      const current = prev[selectedCityKey] || [];
      return {
        ...prev,
        [selectedCityKey]: current.map(c => c.id === crewId ? { ...c, status: "dispatched" as const } : c)
      };
    });

    const dispatchId = `disp_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const targetSuburb = cityData.suburbs[Math.floor(Math.random() * cityData.suburbs.length)];
    const targetPostcode = cityData.postcodes[cityData.suburbs.indexOf(targetSuburb)] || "General";
    
    // Write telemetry log for developer
    onTriggerLog({
      id: `realtime_dispatch_${Date.now()}`,
      type: "webhook",
      status: "success",
      message: `🚨 BRANCH DISPATCH: Activated Field Unit "${crew.name}" (${crew.role}) to Suburb ${targetSuburb} (PCODE: ${targetPostcode}). Status: DISPATCHED [ID: ${dispatchId}]`,
      timestamp: new Date().toLocaleTimeString()
    });

    const newLog = {
      id: dispatchId,
      msg: `✈️ Active Unit [${crew.name}] has boarded the compliance vehicle. Headed to ${targetSuburb} (${targetPostcode}) for client emergency sanitisation response.`,
      time: new Date().toLocaleTimeString(),
      type: "success" as const
    };

    setDispatchLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setIsDispatching(false);
      // Auto return crew after 15 seconds to standby
      setTimeout(() => {
        setLocalCrews(prev => {
          const current = prev[selectedCityKey] || [];
          return {
            ...prev,
            [selectedCityKey]: current.map(c => c.id === crewId ? { ...c, status: "standby" as const } : c)
          };
        });
        setDispatchLogs(prev => [
          {
            id: `ret_${Date.now()}`,
            msg: `✅ Station Return: Unit [${crew.name}] returned back to ${cityData.city} headquarters. Clean complete, diagnostic logs transferred.`,
            time: new Date().toLocaleTimeString(),
            type: "info" as const
          },
          ...prev
        ]);
        onTriggerLog({
          id: `realtime_return_${Date.now()}`,
          type: "system",
          status: "info",
          message: `🏘️ Field unit returning: Unit "${crew.name}" has returned into standby holding within ${cityData.city} branch roster.`,
          timestamp: new Date().toLocaleTimeString()
        });
      }, 15000);
    }, 1000);
  };

  // Add a new crew member to the branch
  const handleAddLocalCrewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName.trim()) return;

    const certsArray = newCrewCert.trim() 
      ? newCrewCert.split(",").map(c => c.trim()) 
      : ["ISO 9001 Compliant Provider", "Standard WHS Induction"];

    const newCrew: LocalCrew = {
      id: `crew_added_${Date.now()}`,
      name: newCrewName.trim(),
      role: newCrewRole,
      status: "standby",
      certs: certsArray,
      rating: 4.8 + Math.random() * 0.2
    };

    setLocalCrews(prev => {
      const current = prev[selectedCityKey] || [];
      return {
        ...prev,
        [selectedCityKey]: [...current, newCrew]
      };
    });

    onTriggerLog({
      id: `roster_addition_${Date.now()}`,
      type: "schema",
      status: "success",
      message: `👤 ROSTER EXPANSION: Successfully inducted credentialed technician "${newCrew.name}" into ${cityData.city} Regional Division grid. Status: STANDBY.`,
      timestamp: new Date().toLocaleTimeString()
    });

    setNewCrewName("");
    setNewCrewCert("");
    
    // Add success inline log too
    setDispatchLogs(prev => [
      {
        id: `ind_${Date.now()}`,
        msg: `👥 Crew Inducted: [${newCrew.name}] inducted with certifications: ${certsArray.join(", ")}.`,
        time: new Date().toLocaleTimeString(),
        type: "info" as const
      },
      ...prev
    ]);
  };

  // Adjust branch hourly rates
  const handleRateChange = (key: string, newRate: number) => {
    setBranchRates(prev => ({
      ...prev,
      [key]: newRate
    }));
    
    onTriggerLog({
      id: `price_adjust_${key}_${Date.now()}`,
      type: "system",
      status: "info",
      message: `💰 Dynamic Rate Calibration: Adjusted base starting pricing tier for "${PROGRAMMATIC_CITIES_METADATA[key].city}" network to $${newRate}.00 / hr.`,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Toggle suburb active coverage zone
  const toggleSuburbZone = (suburb: string) => {
    setDisabledSuburbs(prev => {
      const list = prev[selectedCityKey] || [];
      const updated = list.includes(suburb)
        ? list.filter(s => s !== suburb)
        : [...list, suburb];
      return {
        ...prev,
        [selectedCityKey]: updated
      };
    });

    const isCurrentlyDisabled = (disabledSuburbs[selectedCityKey] || []).includes(suburb);
    onTriggerLog({
      id: `zone_toggle_${Date.now()}`,
      type: "geo",
      status: isCurrentlyDisabled ? "success" : "warning",
      message: `🗺️ Geo Boundary Update: ${isCurrentlyDisabled ? "Restored" : "Temporarily suspended"} emergency dispatch service availability for "${suburb}" zone within the ${cityData.city} branch catchment.`,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Generate distance-based simulated coordinates interlinking array
  const generateInterlinks = (currentCity: CitySEOPage) => {
    const list: Array<{ from: string; to: string; distanceKm: number }> = [];
    const keys = Object.keys(currentCity.postcodeLatitudes);
    
    for (let i = 0; i < keys.length - 1; i++) {
      const fromPC = keys[i];
      const toPC = keys[i + 1];
      const fromLat = currentCity.postcodeLatitudes[fromPC];
      const fromLng = currentCity.postcodeLongitudes[fromPC];
      const toLat = currentCity.postcodeLatitudes[toPC];
      const toLng = currentCity.postcodeLongitudes[toPC];
      if (fromLat && toLat && fromLng && toLng) {
        const dist = Math.sqrt(Math.pow(fromLat - toLat, 2) + Math.pow(fromLng - toLng, 2)) * 111;
        list.push({
          from: `${currentCity.suburbs[i]} (${fromPC})`,
          to: `${currentCity.suburbs[i + 1]} (${toPC})`,
          distanceKm: Math.round(dist * 10) / 10 || 3.8
        });
      }
    }
    return list.slice(0, 4); // Limit to top 4 for perfect layout spacing
  };

  const interlinksList = generateInterlinks(cityData);
  const currentHourlyRate = branchRates[selectedCityKey] || cityData.hourlyRate;
  const crewMembers = localCrews[selectedCityKey] || [];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-16">
      
      {/* Decorative top strip */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 h-2 w-full" />
      
      {/* Header Banner - High-fidelity styling */}
      <div className="bg-slate-900 text-white py-12 px-4 shadow-xl border-b border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-20 -translate-y-10 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute left-0 bottom-0 -translate-x-20 translate-y-10 w-80 h-80 bg-pink-500/5 blur-3xl rounded-full" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> National Branch Coverage & Asset Engine
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
              City Branch Discovery & Lands Hub
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Explore dynamic geolocated landing details, audit compliance frameworks, and take real-time operational control of localized field crew dispatches across physical Australian offices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Quick Postcode Search Router */}
            <form onSubmit={handlePostcodeLookup} className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Lookup Postcode (e.g. 5000 Adelaide)"
                value={searchPostcode}
                onChange={(e) => setSearchPostcode(e.target.value)}
                className="w-full pl-10 pr-24 py-3 bg-slate-950/80 border border-slate-750 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-505 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Route Hub
              </button>
            </form>
          </div>
        </div>
        
        {/* Error notification */}
        {searchError && (
          <div className="max-w-7xl mx-auto mt-4 py-2 px-4 bg-red-950/50 border border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-300 font-mono text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Grid of Cities & Active Indicators */}
      <div className="bg-white border-b border-slate-100 py-3.5 px-4 sticky top-[76px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">Active Branches:</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(PROGRAMMATIC_CITIES_METADATA) as Array<keyof typeof PROGRAMMATIC_CITIES_METADATA>).map((key) => {
                const meta = PROGRAMMATIC_CITIES_METADATA[key];
                const isActive = selectedCityKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedCityKey(key);
                      setSearchError("");
                      onTriggerLog({
                        id: `branch_select_${key}_${Date.now()}`,
                        type: "system",
                        status: "info",
                        message: `🏢 Render City Branch: Transitioned active workspace viewport to focus onto "${meta.city}" branch HQ.`,
                        timestamp: new Date().toLocaleTimeString()
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-emerald-400 shadow"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📍 {meta.city}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Branches Online</span>
            </div>
            <span className="text-slate-300">|</span>
            <span>Est. Combined SLA: <b>12.8 Mins</b></span>
          </div>
        </div>
      </div>

      {/* Primary Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SEO CITY LANDING PANEL (7 Columns) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Visual Brand Cover */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-150 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-slate-100 opacity-20 transform rotate-12">
                <Building2 className="w-40 h-40" />
              </div>

              <div className="relative z-10 space-y-6">
                
                {/* City title details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 font-mono font-bold uppercase">
                        State: {cityData.state}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping" />
                        Online & Staffed
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      AastaClean {cityData.city} Branch
                    </h2>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center gap-4 shrink-0 font-mono">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Hourly Cost Tier</p>
                      <p className="text-2xl font-black text-indigo-600">${currentHourlyRate}<span className="text-xs text-slate-400 font-bold">/hr</span></p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-650 text-sm leading-relaxed font-sans mt-2">
                  Our premier {cityData.city} regional office acts as our primary central dispatch coordinator supporting all adjacent neighborhoods within the {cityData.state} perimeter. Equipped with hospital-grade filtration units and ISO 9001 certified chemical solutions, our crews handle emergency bio-cleans and silica containment with rigorous professionalism.
                </p>

                {/* Suburbs Cover Chips */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" /> Active Service Geofence Suburbs ({cityData.suburbs.length})
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">Click suburb to toggle status</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    AASTACLEAN operates a strict geofence standard within a 30-minute response boundary. Suspending or restoring zones affects dynamic customer checkouts instantly.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {cityData.suburbs.map((sub, i) => {
                      const postcode = cityData.postcodes[i] || "6000";
                      const isDisabled = (disabledSuburbs[selectedCityKey] || []).includes(sub);
                      return (
                        <div
                          key={sub}
                          onClick={() => toggleSuburbZone(sub)}
                          className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold cursor-pointer select-none transition-all duration-200 flex items-center gap-2 ${
                            isDisabled
                              ? "bg-red-50 border-red-200 text-red-700 line-through decoration-slate-400 opacity-60"
                              : "bg-indigo-50/50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          <CircleDot className={`w-3 h-3 shrink-0 ${isDisabled ? "text-red-500" : "text-emerald-500"}`} />
                          <span>{sub} <span className="font-mono text-[9px] text-slate-400 ml-0.5">({postcode})</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Local Landmarks & Regional Proof Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 font-sans">
                  <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-150">
                    <p className="text-[10px] text-indigo-650 font-black uppercase tracking-wider font-mono">Verified Regional Offices</p>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Main HQ: {cityData.suburbs[0]} Plaza
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Depot Hub: {cityData.city} Metro Transit Block
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> Regional Manager Contact Active
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 text-left">
                    <p className="text-[10px] text-indigo-650 font-black uppercase tracking-wider font-mono">Proximity Landmarks Served</p>
                    <div className="flex flex-wrap gap-1">
                      {cityData.localLandmarks.map((landmark) => (
                        <span key={landmark} className="px-2 py-0.5 rounded bg-slate-200/80 text-[10px] font-bold text-slate-600">
                          {landmark}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Localized Contact Block (High fidelity layout) */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-indigo-900">
                  <div className="space-y-1">
                    <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">Localized Operational Hotline</p>
                    <h4 className="text-lg font-extrabold flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-emerald-400" /> +61 1300 AASTA ({cityData.city} Line)
                    </h4>
                    <p className="text-[10px] text-slate-400">Direct connection line routes through local duty coordinators.</p>
                  </div>
                  
                  <button
                    onClick={() => onOpenQuote(cityData.topService)}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Instant Local Dispatch</span>
                  </button>
                </div>

              </div>
            </div>

            {/* NEIGHBOR ROUTING AND INTERLINKS MATRIX */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-150 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" /> High-Density Geospacial Relational Matrix (Neighbor Nodes)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Interconnecting adjacent nodes reinforces high authority listings for modern LLM searches like Gemini and Google Search. This structure maps actual physical distances between adjacent service suburbs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs text-slate-600">
                {interlinksList.map((link, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-slate-700 text-[10px] truncate max-w-[200px]">{link.from} ↔ {link.to}</span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">{link.distanceKm} km</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>WHS Compliance Standards: <b>{cityData.whsAct}</b></span>
                <span>Agency: <b>{cityData.regulatoryAgency}</b></span>
              </div>
            </div>

          </div>

          {/* BRANCH MANAGEMENT SUITE & OPERATIONAL CONTROLS (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Branch Slider Calibration Settings */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 text-left space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">Branch Rate Calibration</h4>
                    <p className="text-[9px] text-slate-500 font-mono">CALIBRATE REGIONAL BASELINE</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Active Slider</span>
              </div>

              <p className="text-xs text-slate-400 leading-normal">
                Fine-tune base hourly rates for the active branch. Rate revisions affect dynamic estimator checks and sitemap quotes in real-time.
              </p>

              <div className="space-y-4 font-mono text-sm pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-semibold">{cityData.city} Starting Base:</span>
                    <span className="text-emerald-400 font-bold text-base bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      ${currentHourlyRate}.00 / hr
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="35"
                    max="80"
                    step="1"
                    value={currentHourlyRate}
                    onChange={(e) => handleRateChange(selectedCityKey, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>$35 Min</span>
                    <span>$50 Standard</span>
                    <span>$80 Premium Tech</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] leading-relaxed text-slate-400">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-slate-300 uppercase">Interactive Margin Impact</span>
                    <span className="text-emerald-400 font-mono">75% Net Max</span>
                  </div>
                  SLA targets and insurance premiums scale based on active hourly tariffs. Adjusted pricing factors maintain local logistics viability.
                </div>
              </div>
            </div>

            {/* 2. Roster Management & Certified Field Crew Roster */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-150 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Crew Roster</h3>
                    <p className="text-[9px] text-slate-500 font-mono">VERIFIED GEOFENCED FORCE</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {crewMembers.length} Available
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                Inducted cleaners are geofenced and matched dynamically to jobs. Simulate immediate field-crew dispatch, or enroll new technicians.
              </p>

              {/* Roster List of Technicians */}
              <div className="space-y-3 pt-1">
                {crewMembers.map((crew) => (
                  <div key={crew.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 font-sans space-y-2.5 hover:shadow-xs transition-shadow">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-900 leading-none">{crew.name}</p>
                          <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold font-mono tracking-wider uppercase ${
                            crew.status === "dispatched"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : crew.status === "active"
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                : "bg-slate-200 text-slate-600"
                          }`}>
                            {crew.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium font-mono">{crew.role}</p>
                      </div>

                      {/* Dispatch simulated action */}
                      <button
                        onClick={() => handleSimulateDispatch(crew.id)}
                        disabled={crew.status === "dispatched" || isDispatching}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl font-mono transition-all inline-flex items-center gap-1 ${
                          crew.status === "dispatched"
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-slate-900 text-white cursor-pointer active:scale-95"
                        }`}
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Dispatch Field Crew</span>
                      </button>
                    </div>

                    {/* Cert chips */}
                    <div className="flex flex-wrap gap-1">
                      {crew.certs.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-white text-[9px] font-bold text-indigo-600 border border-slate-200/80 font-mono">
                          🛡️ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Crew Member Form Expansion */}
              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleAddLocalCrewMember} className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-indigo-700 font-black uppercase">
                    <PlusCircle className="w-4 h-4 text-indigo-600" /> Add Credentialed Technician
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="text-left space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Crew Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={newCrewName}
                        onChange={(e) => setNewCrewName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="text-left space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Role Specialty</label>
                      <select
                        value={newCrewRole}
                        onChange={(e) => setNewCrewRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Sanitation Specialist">Sanitation Specialist</option>
                        <option value="HEPA Dust Extractor">HEPA Dust Extractor</option>
                        <option value="Compliance Care Officer">Compliance Care Officer</option>
                        <option value="Solar Matrix Specialist">Solar Matrix Specialist</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">Inductions & Certs (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="Class-H HEPA, First Aid, Silica Cert"
                      value={newCrewCert}
                      onChange={(e) => setNewCrewCert(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-800 rounded-xl focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider transition-all"
                  >
                    Induct onto Active Roster
                  </button>
                </form>
              </div>

            </div>

            {/* 3. SIMULATOR LOGS AND DISPATCH FEED (Live) */}
            {dispatchLogs.length > 0 && (
              <div className="bg-slate-950 border border-slate-850 text-white rounded-3xl p-5 text-left space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] uppercase tracking-widest font-black">Live Telemetry Roster Feed</span>
                  </div>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                </div>

                <div className="space-y-2 text-[10px] max-h-40 overflow-y-auto leading-relaxed divide-y divide-slate-900/60">
                  {dispatchLogs.map((log) => (
                    <div key={log.id} className="pt-2 text-slate-300">
                      <div className="flex justify-between text-[8px] text-slate-500">
                        <span>SYS ID: {log.id}</span>
                        <span>{log.time}</span>
                      </div>
                      <p className="mt-0.5">{log.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
