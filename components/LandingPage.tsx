
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wand2, ArrowRight, Box, Palette, Zap, CheckCircle2, Smartphone, MousePointerClick, Star, Quote, HelpCircle, ShieldCheck, Copyright } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { useApp } from '../src/context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setOriginalImage, user } = useApp();

  const handleStart = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/auth');
    }
  };

  const handleImageUpload = (base64: string) => {
    setOriginalImage(base64);
    if (user) {
      navigate('/app');
    } else {
      navigate('/auth');
    }
  };
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Hauteur de la navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // FAQ Data
  const faqs = [
    {
      question: "Est-ce que mes photos sont privées ?",
      answer: "Absolument. Vos photos sont envoyées de manière sécurisée à l'IA pour le traitement et sont immédiatement supprimées de nos serveurs une fois l'avatar généré. Nous ne stockons pas vos visages.",
      icon: <ShieldCheck className="text-green-500" size={20} />
    },
    {
      question: "Puis-je utiliser l'avatar commercialement ?",
      answer: "Oui ! Les images générées vous appartiennent. Vous pouvez les utiliser pour votre chaîne Youtube, Twitch, votre site web ou vos réseaux sociaux sans restriction.",
      icon: <Copyright className="text-blue-500" size={20} />
    },
    {
      question: "Comment fonctionnent les crédits ?",
      answer: "À l'inscription, vous recevez 6 crédits gratuits. 1 crédit = 1 génération d'image. Si vous avez besoin de plus, nos plans payants offrent des générations illimitées.",
      icon: <Zap className="text-yellow-500" size={20} />
    },
    {
      question: "Quelle est la qualité des images ?",
      answer: "Nous générons des images en haute définition (jusqu'à 2048x2048px avec le plan Pro), parfaites pour l'impression ou l'affichage sur écrans rétina.",
      icon: <Star className="text-purple-500" size={20} />
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              E
            </div>
            <span className="text-2xl font-display font-bold text-gray-900">Emojify<span className="text-primary">.io</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-6 font-medium text-gray-600 text-sm">
            <a href="#test-drive" onClick={(e) => scrollToSection(e, 'test-drive')} className="hover:text-primary transition-colors cursor-pointer">Essai</a>
            <a href="#styles" onClick={(e) => scrollToSection(e, 'styles')} className="hover:text-primary transition-colors cursor-pointer">Styles</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-primary transition-colors cursor-pointer">Fonctionnement</a>
            <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="hover:text-primary transition-colors cursor-pointer">Avis</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-primary transition-colors cursor-pointer">Tarifs</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-primary transition-colors cursor-pointer">FAQ</a>
          </div>
          <button 
            onClick={handleStart}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-black hover:scale-105 transition-all shadow-lg border border-gray-800 text-sm md:text-base"
          >
            {user ? 'Dashboard' : 'Commencer'}
          </button>
        </div>
      </nav>

      {/* Hero Section with Scanner Effect */}
      <header className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-[20%] w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-[20%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold text-gray-600">Nouveau : Style Clay disponible</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 leading-tight mb-8 tracking-tight max-w-4xl">
            Transformez <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">tout en 3D</span> en un instant.
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            L'outil préféré des créateurs pour transformer une simple photo en un avatar expressif et professionnel grâce à l'IA Gemini.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20 w-full md:w-auto">
            <button 
              onClick={handleStart}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              <Wand2 className="group-hover:rotate-12 transition-transform" />
              {user ? 'Accéder au Studio' : 'Créer mon premier émoji'}
            </button>
            <p className="text-sm text-gray-400 mt-2 md:mt-0">Commencer gratuitement</p>
          </div>

          {/* THE SCANNER VISUAL */}
          <div className="relative w-full max-w-3xl mx-auto animate-fade-in-up">
            {/* Glass Panel Wrapper */}
            <div className="glass-panel rounded-[2rem] p-3 md:p-6 relative">
              
              {/* Floating Labels */}
              <div className="absolute top-8 left-8 z-20 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-gray-500 border border-gray-100 hidden md:block">
                Input: Photo
              </div>
              <div className="absolute bottom-8 right-8 z-20 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary border border-gray-100 hidden md:block">
                Output: Clay Style
              </div>

              <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] flex items-center justify-center relative border border-gray-100">
                 
                 <div className="flex items-center justify-center gap-4 md:gap-12 w-full px-4 md:px-20">
                    
                    {/* Source Image (Left) */}
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-200 rounded-2xl shadow-inner flex items-center justify-center text-gray-400 relative overflow-hidden">
                       {/* Mock Silhouette */}
                       <svg className="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                       </svg>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300">
                       <ArrowRight size={32} />
                    </div>

                    {/* Target Image (Right) with Scanner Effect */}
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-[#FFDFA8] rounded-2xl shadow-xl flex items-center justify-center text-6xl md:text-8xl relative overflow-hidden border-4 border-white">
                       {/* The "Hidden" Emoji initially */}
                       <div className="relative z-10">😎</div>
                       
                       {/* Scanning Overlay */}
                       <div className="absolute inset-0 pointer-events-none z-20">
                          <div className="w-full h-2 bg-primary/80 blur-[2px] shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan absolute top-0 left-0"></div>
                       </div>
                    </div>
                 </div>

              </div>
            </div>
            
            {/* Background Decoration under the scanner */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2.5rem] blur-xl -z-10 opacity-50"></div>
          </div>

        </div>
      </header>

      {/* Free Test Section (MOVED UP) */}
      <section id="test-drive" className="py-24 relative overflow-hidden bg-gray-900">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]"></div>

        <div className="container mx-auto px-6 relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
             
             <div className="w-full md:w-1/2 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-primary-300 font-bold text-xs uppercase tracking-wider mb-6">
                   <Zap size={14} className="fill-current" />
                   Test Instantané
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                   Essayez l'expérience <br/>dès maintenant
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                   Pas besoin de sortir la carte bancaire. Importez simplement votre photo et laissez la magie opérer. Vous obtiendrez 6 crédits offerts à l'inscription pour peaufiner votre style.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                         <div className="font-bold text-white">100% Gratuit</div>
                         <div className="text-xs text-gray-400">Pas de carte requise</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                         <Smartphone size={20} />
                      </div>
                      <div>
                         <div className="font-bold text-white">Mobile Friendly</div>
                         <div className="text-xs text-gray-400">Fonctionne sur tous vos appareils</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="w-full md:w-1/2 flex justify-center">
                {/* Using the ImageUploader here directly */}
                <div className="relative w-full max-w-md">
                   <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-30 animate-pulse-fast"></div>
                   <div className="relative bg-white rounded-3xl p-2 shadow-2xl transform transition-transform duration-500">
                      <div className="absolute -top-6 -right-6 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-black shadow-lg z-30 transform rotate-12 border-4 border-white text-sm uppercase tracking-widest">
                          Gratuit !
                      </div>
                      <ImageUploader onImageSelected={handleImageUpload} />
                   </div>
                </div>
             </div>

           </div>
        </div>
      </section>

      {/* Styles Showcase Section */}
      <section id="styles" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">Styles illimités</span>
            <h2 className="text-4xl font-display font-bold text-gray-900 mt-2 mb-6">Découvrez nos styles uniques</h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Que vous ayez besoin d'un avatar <strong>professionnel mais amical</strong> pour LinkedIn, 
              d'un personnage <strong>Gaming</strong> stylisé pour Twitch, ou d'une image de profil <strong>Artistique</strong> pour Instagram, 
              Emojify s'adapte à votre univers. Notre IA maîtrise les nuances de chaque style.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: 3D Magic */}
            <div className="bg-white rounded-3xl p-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="h-64 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                 <div className="text-[8rem] drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">🧑‍🚀</div>
                 <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                   Idéal pour le Social
                 </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Box size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">3D Magic</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Le look "film d'animation". Éclairage studio, textures lisses et rendu adorable. Parfait pour les profils qui veulent inspirer la sympathie.
                </p>
              </div>
            </div>

            {/* Card 2: Clay */}
            <div className="bg-white rounded-3xl p-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="h-64 rounded-2xl bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center relative overflow-hidden">
                 <div className="text-[8rem] drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">🦊</div>
                 <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                   Tendance Créative
                 </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Palette size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Clay Motion</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Style pâte à modeler fait main. Imparfait, tactile et incroyablement charmant. Idéal pour les artistes et créateurs de contenu.
                </p>
              </div>
            </div>

             {/* Card 3: Anime */}
             <div className="bg-white rounded-3xl p-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="h-64 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative overflow-hidden">
                 <div className="text-[8rem] drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">🦸‍♀️</div>
                 <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                   Pour les Gamers
                 </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Zap size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Manga / Anime</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Lignes claires, grands yeux et cel-shading. Transformez-vous en héros de votre propre série pour Discord ou Twitch.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-display font-bold text-gray-900">Comment ça marche ?</h2>
               <p className="text-gray-500 mt-4">De votre selfie à votre avatar en 3 étapes simples</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               
               <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                     <Smartphone size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Uploadez</h3>
                  <p className="text-gray-500 text-sm px-8">
                     Prenez un selfie ou choisissez une photo de votre galerie. Assurez-vous que votre visage est bien visible.
                  </p>
               </div>

               <div className="flex flex-col items-center text-center relative">
                   {/* Arrow connecting steps (desktop only) */}
                   <div className="hidden md:block absolute top-10 -right-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent transform translate-x-[-50%] z-0"></div>
                   
                  <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-sm z-10 relative bg-white">
                     <MousePointerClick size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">2. Choisissez</h3>
                  <p className="text-gray-500 text-sm px-8">
                     Sélectionnez votre style artistique préféré (3D, Clay, Anime) et l'humeur que vous souhaitez transmettre.
                  </p>
               </div>

               <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-sm">
                     <Wand2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">3. Générez</h3>
                  <p className="text-gray-500 text-sm px-8">
                     L'IA Gemini analyse vos traits et génère un avatar unique en quelques secondes. Téléchargez et partagez !
                  </p>
               </div>

            </div>
         </div>
      </section>

      {/* Testimonials Section (NEW) */}
      <section id="testimonials" className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="flex flex-col items-center text-center mb-16">
              <div className="bg-primary/10 text-primary px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider mb-4">
                Ils nous font confiance
              </div>
              <h2 className="text-4xl font-display font-bold text-gray-900 max-w-2xl">
                 Ce qu'ils disent de nous
              </h2>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative hover:transform hover:-translate-y-1 transition-transform duration-300">
                 <Quote className="absolute top-6 right-6 text-gray-100 w-10 h-10" />
                 <div className="flex gap-1 mb-4 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                 </div>
                 <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                    "J'utilise Emojify pour tous mes profils sociaux. Le style <span className="text-primary font-bold">Clay</span> est juste incroyable, tout le monde me demande qui a fait mon avatar !"
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-2xl flex items-center justify-center">👩‍🎨</div>
                    <div>
                       <div className="font-bold text-gray-900">Sophie L.</div>
                       <div className="text-xs text-gray-400">Designer Freelance</div>
                    </div>
                 </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative hover:transform hover:-translate-y-1 transition-transform duration-300">
                 <Quote className="absolute top-6 right-6 text-gray-100 w-10 h-10" />
                 <div className="flex gap-1 mb-4 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                 </div>
                 <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                    "En tant que streamer, je voulais une identité visuelle unique sans dépenser des centaines d'euros. Emojify a fait le job en 10 secondes."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-2xl flex items-center justify-center">🎮</div>
                    <div>
                       <div className="font-bold text-gray-900">Marc D.</div>
                       <div className="text-xs text-gray-400">Twitch Streamer</div>
                    </div>
                 </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 relative hover:transform hover:-translate-y-1 transition-transform duration-300">
                 <Quote className="absolute top-6 right-6 text-gray-100 w-10 h-10" />
                 <div className="flex gap-1 mb-4 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                 </div>
                 <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                    "Nous avons généré des avatars pour toute l'équipe Slack. L'ambiance est beaucoup plus fun maintenant ! L'outil est super intuitif."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-2xl flex items-center justify-center">💼</div>
                    <div>
                       <div className="font-bold text-gray-900">Julie T.</div>
                       <div className="text-xs text-gray-400">Responsable RH</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Pricing Section (Integrated into Landing) */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900">Des tarifs simples</h2>
            <p className="text-gray-500 mt-4">Commencez gratuitement, payez pour aller plus loin.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
             {/* Free Tier */}
             <div className="p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Découverte</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">0€<span className="text-sm text-gray-400 font-normal">/mois</span></div>
                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> 6 crédits offerts</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Style Standard</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Qualité SD</li>
                </ul>
                <button onClick={handleStart} className="w-full py-3 rounded-xl border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors">
                   S'inscrire
                </button>
             </div>

             {/* Pro Tier */}
             <div className="p-8 rounded-3xl bg-gray-900 text-white shadow-2xl transform scale-105 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Recommandé</div>
                <h3 className="text-xl font-bold mb-2">Créateur</h3>
                <div className="text-4xl font-bold mb-6">5000 FCFA<span className="text-sm text-gray-400 font-normal">/mois</span></div>
                <ul className="space-y-3 mb-8 text-sm text-gray-300">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/> 50 Crédits / mois</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/> Tous les styles (Clay, 3D)</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/> Haute Définition (4K)</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/> Pas de watermark</li>
                </ul>
                <button onClick={handleStart} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg hover:shadow-primary/50 transition-shadow">
                   Commencer maintenant
                </button>
             </div>

             {/* Agency Tier */}
             <div className="p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Agence</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">15000 FCFA<span className="text-sm text-gray-400 font-normal">/mois</span></div>
                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Tout du plan Créateur</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Accès API</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Licence Commerciale</li>
                   <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/> Support prioritaire</li>
                </ul>
                <button 
                  onClick={() => window.location.href = 'mailto:faustoswald@icloud.com'}
                  className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-400 font-bold hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                   Nous contacter
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (NEW) */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
             <div className="w-16 h-16 bg-indigo-100 text-primary rounded-2xl flex items-center justify-center mb-6">
               <HelpCircle size={32} />
             </div>
             <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Questions Fréquentes</h2>
             <p className="text-gray-500 max-w-xl">Vous avez des questions ? Nous avons les réponses.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    {faq.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section (NEW) */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primaryDark to-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
             {/* Decorative circles */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
             
             <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Prêt à transformer votre image ?</h2>
                <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-12">
                   Rejoignez plus de 10,000 créateurs qui utilisent Emojify pour se démarquer.
                </p>
                <button 
                  onClick={handleStart}
                  className="bg-white text-primaryDark px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                >
                   Commencer gratuitement
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  E
                </div>
                <span className="font-bold text-gray-900 text-xl">Emojify.io</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                La plateforme de création d'avatars IA la plus simple et la plus puissante du marché.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Produit</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><a href="#styles" className="hover:text-primary">Styles</a></li>
                <li><a href="#pricing" className="hover:text-primary">Tarifs</a></li>
                <li><a href="#" className="hover:text-primary">API (Bientôt)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Ressources</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link to="/tutorials" className="hover:text-primary">Tutoriels</Link></li>
                <li><Link to="/help" className="hover:text-primary">Centre d'aide</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Légal</h4>
              <ul className="space-y-4 text-gray-500 text-sm">
                <li><Link to="/privacy" className="hover:text-primary">Confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-primary">CGU</Link></li>
                <li><Link to="/legal" className="hover:text-primary">Mentions Légales</Link></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 Emojify Me. Tous droits réservés.
            </div>
            <div className="flex gap-6">
               <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Smartphone size={18}/></a>
               <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Star size={18}/></a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
