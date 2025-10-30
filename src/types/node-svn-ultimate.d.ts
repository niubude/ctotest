declare module 'node-svn-ultimate' {
  interface SvnCommands {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    diff: (...args: any[]) => void;
  }

  interface SvnModule {
    commands: SvnCommands;
  }

  const svn: SvnModule;
  export default svn;
}
