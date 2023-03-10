import {graphql, useStaticQuery} from "gatsby";

export default function getNavData() {
    return useStaticQuery(graphql`
            query NavQuery {
              site {
                siteMetadata {
                  nav {
                    title
                    slug
                  }
                }
              }
            }
          `)
}