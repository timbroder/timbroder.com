import React from 'react';
import Helmet from 'react-helmet';

import 'prismjs/themes/prism-solarizedlight.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

import '../assets/scss/init.scss';


class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="layout">
        <Helmet defaultTitle="TimBroder.com" />
        {children()}
      </div>
    );
  }
}

export default Layout;
