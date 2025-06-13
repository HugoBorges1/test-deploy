import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
    const categories = [
        { name: "Filmes", href: "/category/filmes" },
        { name: "Séries", href: "/category/series" },
        { name: "Animes", href: "/category/animes" },
        { name: "Jogos", href: "/category/jogos" },
        { name: "Músicas", href: "/category/musicas" },
        { name: "Memes", href: "/category/memes" },
    ];

    const socialLinks = [
        { icon: Instagram, href: "#" },
        { icon: Twitter, href: "#" },
        { icon: Facebook, href: "#" },
    ];

    return (
        <div className="bg-black border-t border-gray-800">
            <div className="h-px bg-gradient-to-r from-transparent via-[#606cfc] to-transparent" />
            {/* ALTERADO: Padding vertical principal reduzido */}
            <div className="container mx-auto px-6 py-6">
                {/* ALTERADO: Espaçamento do grid reduzido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Seção da Marca */}
                    <div className="flex flex-col items-center md:items-start">
                        <Link to='/' className='flex items-center'>
                            <span className='text-4xl font-bold bg-gradient-to-r from-[#606cfc] to-[#ff64c4] text-transparent bg-clip-text'>
                                URPOP
                            </span>
                        </Link>
                        <p className="mt-2 text-gray-400 text-sm text-center md:text-left">
                            Sua loja de cultura pop, do seu jeito.
                        </p>
                    </div>

                    {/* Seção de Navegação */}
                    <div className="text-center">
                        {/* ALTERADO: Margem do título reduzida */}
                        <h3 className="font-bold text-white uppercase mb-3">Categorias</h3>
                        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            {categories.map((category) => (
                                <li key={category.name}>
                                    <Link to={category.href} className="text-gray-400 hover:text-white transition-colors">
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Seção Social e Contato */}
                    <div className="flex flex-col items-center md:items-end">
                        {/* ALTERADO: Margem do título reduzida */}
                        <h3 className="font-bold text-white uppercase mb-3">Siga-nos</h3>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <a key={index} href={social.href} className="text-gray-400 hover:text-white transition-colors">
                                    <social.icon size={24} />
                                </a>
                            ))}
                        </div>
                        <div className="mt-4 text-center md:text-right">
                            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">Política de Privacidade</Link>
                            <span className="text-gray-500 mx-2">|</span>
                            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">Termos de Serviço</Link>
                        </div>
                    </div>
                </div>

                {/* Seção de Copyright */}
                {/* ALTERADO: Espaçamento da seção de copyright reduzido */}
                <div className="mt-6 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} URPOP. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default Footer;