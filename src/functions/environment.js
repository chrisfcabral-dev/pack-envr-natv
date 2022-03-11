export const environments = (argv) => {
  
  const vars = {
    stage: argv && argv.stage ? argv.stage : 'local',
    running: argv && argv.running ? argv.running : 'offline'
  };

  const cthulhi = environment({ ...vars, fileParsed: argv });

  return {
    ...vars,
    ...cthulhi.environment
  }
}

export const environment = (options) => {

  let vars = options ? options : {}

  const fileParsed = options.fileParsed
  const regexParams = /\$\{([^\$\}]*)\}/

  iterateFileParams(fileParsed, (value) => {
    return replaceFileParam(regexParams, fileParsed, value, vars);
  })

  return fileParsed;
}

const getFileParam = (p, o) => {
  return p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : '', o)
}

const replaceFileParam = (regex, obj, val, options) => {
  var match;

  while (match = regex.exec(val)) {
    if (match && match[0]) {
      let oPathValue = '';
      let oPaths = match[1].split(',');
      oPaths.forEach(oPathItem => {
        if (!oPathValue) {
          const oPathRef = oPathItem.trim().split(':');

          if (oPathRef.length > 1) {

            switch (oPathRef[0]) {
              case 'self':
                oPathValue = getFileParam(oPathRef[1].split('.'), obj);
                break;
              case 'opt':
                oPathValue = getFileParam(oPathRef[1].split('.'), options);
                break;
            }

          } else {
            oPathValue = oPathItem.trim().replace(/\'/g, '');
          }
        }
      });
      val = typeof oPathValue === 'object' ? oPathValue : val.replace(match[0], oPathValue);
    }
  }


  return val;
}

const iterateFileParams = (fileParams, callback) => {

  if(fileParams) {

    if (typeof fileParams == 'string') {
      fileParams = callback(fileParams);
    }

    if (typeof fileParams == 'object') {

      Object.keys(fileParams).forEach(key => {
    
        if (typeof fileParams[key] === 'object') {
          iterateFileParams(fileParams[key], callback)
        }
    
        if (typeof fileParams[key] == 'string') {
          fileParams[key] = callback(fileParams[key])
        }
    
      })
      
    }
  }

}