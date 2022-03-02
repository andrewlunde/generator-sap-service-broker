// Debug by launching like this.
// npx --node-arg=--inspect yo sap-service-broker
// Then run the "Yo Partner-Eng" run profile
//
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
/* eslint-disable no-useless-concat */
/* eslint-disable block-scoped-var */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable spaced-comment */
/* eslint-disable camelcase */
/* eslint-disable capitalized-comments */
"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");
const mkdirp = require("mkdirp");

const exec = require("child_process").execSync;

function cf_is_logged_in() {
  var result = exec('cf api');
  var resStr = result.toString("utf8");
  resStr = resStr.toLowerCase();
  if (resStr.search("no api endpoint set.") >= 0) {
    return false;
  } else {
    if (resStr.search("not logged in.") >= 0) {
      return false;
    } else {
      return true;
    }
  }
}

// npm ls - g @sap/sbf
function sbf_installed() {
  var result = exec('npm ls -g @sap/sbf');
  var resStr = result.toString("utf8");
  resStr = resStr.toLowerCase();
  if (resStr.search("(empty)") >= 0) {
    return false;
  } else {
    if (resStr.search("@sap/sbf") >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

function install_sbf() {
  var result = exec('npm install -g @sap/sbf');
  var resStr = result.toString("utf8");
  return resStr;
}

function get_domains() {

  var retarry = [];

  // retarry.push('domain.com');
  
  if (cf_is_logged_in()) {
    var result = exec('cf domains');

    if (result) {
      var output = result.toString("utf8");
      var lines = String(output).split("\n");
      var line = "";
      var first = true;
      for (var i = 1; i <= lines.length; i++) {
        line = lines[i - 1];
        //console.log(`line: ${line}`);
        var words = String(line.replace(/\s+/g, ' ')).split(" ");
        if ((words[1] == 'shared') || (words[1] == 'owned')) {
          if (words[0] != "apps.internal") {
            if (first) {
              // console.log('domain: ' + words[0]);
              retarry.push(words[0]);
              first = false;
            }
            else {
              if (words[1] == 'owned') {
                //console.log('domain: ' + words[0]);
                retarry.push(words[0]);
              }
            }
          }
        }
      }
    }
  } else {
    retarry.push("Ctrl-C, then cf api ; cf login");
  }

  return retarry;
}


// function makeProjectName(name) {
//   name = _.kebabCase(name);
//   return name;
// }

function suggest_router_name(so_far) {
  //return JSON.stringify(so_far);
  var retstr = "";

  retstr += so_far.app_name + "-app";

  return retstr;
}

function suggest_domain_name(so_far) {
  //return JSON.stringify(so_far);
  var retstr = "";

  var domains = get_domains();

  retstr += domains[0];
  ;

  return retstr;
}


function suggest_uaa_res_name(so_far) {
  //return JSON.stringify(so_far);
  var retstr = "";

  retstr += so_far.app_name + "-uaa";

  return retstr;
}

function suggest_uaa_svc_name(so_far) {
  //return JSON.stringify(so_far);
  var retstr = "";

  retstr += so_far.app_name.toUpperCase() + "_UAA";

  return retstr;
}

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    // This method adds support for a `--no-mkdir` flag
    this.option('mkdir', {type: Boolean, default: true})

    // And you can then access it later; e.g.
    //this.scriptSuffix = this.options.mkdir ? ".coffee" : ".js";
  }

  initializing() {
    this.props = {};
    this.answers = {};
    this.config.defaults({
      project_name: this.appname,
      app_name: "products",
      app_desc: "Products Custom Broker Example",
      suffix_name: "i830671",
      broker_user_name: "broker",
      cf_domain: "cfapps.us10.hana.ondemand.com",
      excust_org_name: "theta",
      vendor_name: "Acme"
    });

  }

  async prompting() {
    var prompts = [];

    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the ${chalk.red("\nService Broker\n")} project generator!`)
    );

    this.log(
      `After you've generated your base MTA project you can enhance it with the following subgenerators.`
      +`\n npx --node-arg=--inspect yo sap-service-broker:subgen`
    );
    this.log(``);
    this.log(``);
    this.log(
      `* = This module is not yet available or is in developoment.  YMMV.`
    );
    this.log(``);

    // const prompts = [
    //   {
    //     type: "confirm",
    //     name: "someAnswer",
    //     message: "Would you like to enable this option?",
    //     default: true
    //   }
    // ];

    /*
    Return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
	  */
    if (this.options.mkdir) {
      prompts.push({
        type: "input",
        name: "project_name",
        message:
          "Enter your project folder name (will be created if necessary).",
        default: this.config.get("project_name") // Default to current folder name
      });
    }
    else {
      this.log(`Option: --no--mkdir   WARNING: Files will be generated into the current directory.`);
    }

    prompts.push({
      type: "input",
      name: "app_name",
      // prefix: "The value here will be used as a suggetion.\n",
      message: "Enter your project application name (will be used for defaults).",
      default: this.config.get("app_name")
    });
      
    prompts.push({
      type: "input",
      name: "app_desc",
      message: "Enter your project application description.",
      default: this.config.get("app_desc") 
    });
      
    prompts.push({
      type: "input",
      name: "suffix_name",
      // prefix: "The value here will be used as a suggetion.\n",
      message: "Enter your c/d/i-user name or other suffix for uniqueness.",
      default: this.config.get("suffix_name")
    });

     prompts.push({
      type: "input",
      name: "broker_user_name",
      // prefix: "The value here will be used as a suggetion.\n",
      message: "Enter a name for your broker user.",
      default: this.config.get("broker_user_name")
    });

    prompts.push({
      type: "input",
      name: "cf_domain",
      // prefix: "The value here will be used as a suggetion.\n",
      message: "Enter your landscape specific CF domain.",
      default: this.config.get("cf_domain")
    });

    prompts.push({
      type: "input",
      name: "excust_org_name",
      // prefix: "The value here will be used as a suggetion.\n",
      message: "Enter an example customer cf organization name.",
      default: this.config.get("excust_org_name")
    });

    prompts.push({
      type: "input",
      name: "vendor_name",
      // prefix: "The value here will be used as a suggetion.\n",
      message: "Enter a vendor name.",
      default: this.config.get("vendor_name")
    });

     // prompts.push({
    //   type: "input",
    //   name: "router_name",
    //   message: "Application router internal module name.",
    //   default: suggest_router_name
    // });
    
    // if (cf_is_logged_in()) {
    //   prompts.push({
    //     type: "list",
    //     name: "domain_name",
    //     prefix: "This list of domain names is based on the current 'cf domains' command.\n",
    //     message: "Domain name.",
    //     // choices: ["cfapps.us10.hana.ondemand.com","conciletime.com"],
    //     choices: get_domains(),
    //     default: suggest_domain_name
    //   });
    // }
      
    // if (!cf_is_logged_in()) {
    //   prompts.push({
    //       type: "input",
    //       name: "domain_name",
    //       prefix: "Enter domain name or abort and login with 'cf login' then 'cf target' commands.\n",
    //       message: "Domain name.",
    //       default: "cfapps.us10.hana.ondemand.com",
    //   });
    // }
      
    this.answers = await this.prompt(prompts);

  }

  default() {
    // var path_basename = path.basename(this.destinationPath());
    if (this.options.mkdir) {
      this.log(
        `Your project must be inside a folder named ${this.answers.project_name}\nI'll automatically create this folder.  Change into it with "cd ${this.answers.project_name}"`
      );
      mkdirp(this.answers.project_name);
      this.destinationRoot(this.destinationPath(this.answers.project_name));
    }
    else {
      this.answers.project_name = ".";
      this.log(
        `Your project will be generated in the current folder ${this.answers.project_name} and may modify existing files.`
        );
      this.destinationRoot(this.destinationPath(this.answers.project_name));
    }
  }

  writing() {
    var pkginfo = require('pkginfo')(module);

    this.config.set("package_version", module.exports.version);

    this.config.set("project_name", this.answers.project_name);
    this.config.set("app_name", this.answers.app_name);
    this.config.set("app_desc", this.answers.app_desc);

    this.config.set("suffix_name", this.answers.suffix_name);
    this.config.set("broker_user_name", this.answers.broker_user_name);
    this.config.set("cf_domain", this.answers.cf_domain);
    this.config.set("excust_org_name", this.answers.excust_org_name);
    this.config.set("vendor_name", this.answers.vendor_name);

    this.config.save();

    // this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));


    var subs = {
      package_version: module.exports.version,
      project_name: this.answers.project_name,
      app_name: this.answers.app_name,
      app_desc: this.answers.app_desc,
      suffix_name: this.answers.suffix_name,
      broker_user_name: this.answers.broker_user_name,
      cf_domain: this.answers.cf_domain,
      excust_org_name: this.answers.excust_org_name,
      vendor_name: this.answers.vendor_name,
    };

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath("README.md"),
      subs
    );

    this.fs.copyTpl(
      this.templatePath("README-technical-user.md"),
      this.destinationPath("README-technical-user.md"),
      subs
    );

    this.fs.copyTpl(
      this.templatePath("prerequisites.md"),
      this.destinationPath("prerequisites.md"),
      subs
    );

     //this.fs.copy(
    //  this.templatePath("gitignore"),
    //  this.destinationPath(".gitignore")
    //);

    // this.fs.copy(
    //   this.templatePath("cdsrc.json"),
    //   this.destinationPath(".cdsrc.json")
    // );

    // this.fs.copy(
    //   this.templatePath("gitignore"),
    //   this.destinationPath(".gitignore")
    // );

    // this.fs.copy(
    //   this.templatePath("vscode/*"),
    //   this.destinationPath(".vscode")
    // );

    // this.fs.copyTpl(
    //   this.templatePath("package.json"),
    //   this.destinationPath("package.json"),
    //   subs
    // );

    // this.fs.copyTpl(
    //   this.templatePath("mta.yaml"),
    //   this.destinationPath("mta.yaml"),
    //   subs
    // );

    this.fs.copyTpl(
      this.templatePath("manifest.yml"),
      this.destinationPath("manifest.yml"),
      subs
    );

    this.fs.copyTpl(
      this.templatePath("tools/*"),
      this.destinationPath("tools"),
      subs
    );
    
    this.fs.copyTpl(
      this.templatePath("broker/*"),
      this.destinationPath("broker"),
      subs
    );

    this.fs.copyTpl(
      this.templatePath("service/*"),
      this.destinationPath("service"),
      subs
    );

    this.fs.copyTpl(
      this.templatePath("consumer/*"),
      this.destinationPath("consumer"),
      subs
    );

    this.fs.copy(
      this.templatePath("gitignore"),
      this.destinationPath(".gitignore")
    );

    this.fs.copyTpl(
      this.templatePath("xs-security.json"),
      this.destinationPath("xs-security.json"),
      subs
    );

    // this.fs.copy(
    //   this.templatePath("app/xs-app.json"),
    //   this.destinationPath(this.answers.router_path + "/xs-app.json")
    // );

    // this.fs.copy(
    //   this.templatePath("db/README.md"),
    //   this.destinationPath(this.answers.database_path + "/README.md")
    // );

    // Now xs-security is embodied in the mta.yaml file freeing this up for cds-security.json
    // this.fs.copyTpl(
    //   this.templatePath("xs-security.json"),
    //   this.destinationPath("xs-security.json"),
    //   subs
    // );

  }

  install() {
    // This.installDependencies();
  }

  end() {
    this.log(``);
    this.log(``);
    this.log(
      `* = This module is not yet available or is in developoment.  YMMV.`
    );
    this.log(``);

    this.log(`\nYour project is ready.  Change into it with "cd ${this.answers.project_name}"`);
    this.log(`Build+Deploy : "cd ${this.answers.project_name} ; mkdir -p mta_archives ; mbt build -p=cf -t=mta_archives --mtar=${this.answers.project_name}.mtar ; cf deploy mta_archives/${this.answers.project_name}.mtar -f"`);
    this.log(`UnDeploy : "cf undeploy ${this.answers.app_name} -f --delete-services"`);
    this.log(`Change into it with "cd ${this.answers.project_name}"`);
    // if (cf_is_logged_in()) {
    //   this.log(JSON.stringify(get_domains()));
    // }
    // if (!sbf_installed()) {
    //   install_sbf();
    // }
  }
};
