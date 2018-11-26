import React from 'react';
import Helmet from 'react-helmet';
import PageTemplateDetails from '../components/PageTemplateDetails';

class PageTemplate extends React.Component {
  render() {
    const siteMetadata = this.props.data.site.siteMetadata;
    const { title } = siteMetadata;
    const page = this.props.data.markdownRemark;
    const { title: pageTitle } = page.frontmatter;

    return (
      <div>
        <Helmet>
          <title>{`${pageTitle} - ${title}`}</title>
        </Helmet>
        <PageTemplateDetails
          siteMetadata={siteMetadata}
          page={page}
        />
      </div>
    );
  }
}

export default PageTemplate;

export const pageQuery = graphql`
  query PageBySlug($slug: String!) {
    site {
      siteMetadata {
        ...sidebarFragment
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        title
        date
      }
    }
  }
`;
