/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const developmentEnvironments = ['development', 'test'];
module.exports = (api) => {
  // See docs about api at https://babeljs.io/docs/en/config-files#apicache

  const development = api.env(developmentEnvironments);

  return {
    presets: [
      // @babel/preset-env will automatically target our browserslist targets
      require('@babel/preset-env'),
      require('@babel/preset-typescript'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [require('@babel/preset-react'), { development }],
    ],
    plugins: [],
  };
};
