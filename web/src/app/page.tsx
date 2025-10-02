export default function Page() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
               }}>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <div className="inline-block p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl">
            {/* XKYS Logo - Runder Kreis */}
            <div className="relative">
              {/* XKYS Logo als runder Kreis */}
              <div className="w-48 h-48 mx-auto mb-8">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-2xl border-4 border-white/20">
                  <div className="w-full h-full rounded-full bg-white p-6 flex items-center justify-center shadow-inner">
                    {/* XKYS Logo im Kreis */}
                    <img 
                      src="/Untitled design.png" 
                      alt="XKYS" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              
              {/* XKYS Text */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-black tracking-[0.3em] mb-2">
                  XKYS
                </h1>
                <p className="text-lg text-black tracking-[0.4em] uppercase font-medium">
                  TECHNOLOGIES
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section - Centered */}
        <div className="max-w-2xl w-full">
          <section className="card p-8 text-center bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Willkommen im Fitnessstudio-Portal
            </h2>
            <p className="text-slate-200 mb-8 text-lg leading-relaxed">
              Verwalte Mitgliedschaften, sammle Punkte beim Check-in und füge deine digitale Mitgliedskarte zum Wallet hinzu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a className="btn btn-primary text-lg px-8 py-3" href="/register">
                Registrieren
              </a>
              <a className="btn btn-secondary text-lg px-8 py-3" href="/admin">
                Admin-Dashboard
              </a>
            </div>
          </section>
        </div>

        {/* Subtle footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm">
            Powered by XKYS Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
