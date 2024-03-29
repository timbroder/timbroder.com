import * as React from "react"
import {Link} from "gatsby"
import {Container} from "./container";
import Headline from "../content/headline";
import Header from "./header";
import Footer from "./footer";

const Layout = ({location, title, children}) => {
    const rootPath = `${__PATH_PREFIX__}/`
    const isRootPath = location.pathname === rootPath

    return (
        <div className="bg-zinc-50">
            <div className="bg-zinc-50 fixed inset-0 flex justify-center sm:px-8">
                <div className="flex w-full max-w-7xl lg:px-8">
                    <div className="w-full bg-white ring-1 ring-zinc-100"/>
                </div>
            </div>
            <div className="relative">
                <Header location={location}/>
                <Container className="mt-16 sm:mt-32">
                    <header className="max-w-2xl">
                        {isRootPath
                            ?
                            <Headline>
                                <Link to="/">{title}</Link>
                            </Headline>
                            :
                            null
                            // <span className="font-bold tracking-tight text-zinc-800 text-2xl">
                            //     <Link to="/">{title}</Link>
                            // </span>
                        }

                        {/*<p className="mt-6 text-base text-zinc-600">*/}
                        {/*    {intro}*/}
                        {/*</p>*/}
                    </header>
                    <div className="mt-16 sm:mt-20">
                        <main>
                            {children}
                        </main>
                    </div>
                </Container>
            </div>
            <Footer/>
        </div>

    )
}

export default Layout
