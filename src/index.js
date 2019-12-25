require("dotenv").config();
const { Confirm, MultiSelect, Select } = require("enquirer");
const { axiosI } = require("./axiosInstance");
const { log, logErr } = require("./logger");

function checkAndLogSettings() {
  log("Checking .env file settings");
  if (
    !process.env.REGISTRY_URL ||
    !process.env.REGISTRY_USER ||
    !process.env.REGISTRY_PASS
  ) {
    logErr("Required .env variable settings missing");
    process.exit(1);
  }
  log("REGISTRY_URL: " + process.env.REGISTRY_URL);
}

async function pickRepo() {
  const result = await axiosI.get(`/v2/_catalog`);

  const prompt = new Select({
    name: "repository",
    message: "Pick a repository",
    choices: result.data.repositories
  });

  return await prompt.run();
}

async function fetchTags(repo) {
  const result = await axiosI.get(`/v2/${repo}/tags/list`);
  return result && result.data && result.data.tags ? result.data.tags : null;
}

async function pickTags(repo) {
  let tags = await fetchTags(repo);

  if (!tags) {
    logErr("This repository has no tags");
    return null;
  }

  tags = tags.sort();

  const prompt = new MultiSelect({
    name: "value",
    message: "Pick tags to delete",
    // limit: 7,
    choices: tags
  });

  const selectedTags = await prompt.run();
  if (selectedTags.length === 0) {
    logErr("No tags selected");
    return null;
  }

  return selectedTags;
}

async function getDetailsOfTag(repo, tag) {
  const config = {
    headers: {
      Accept: "application/vnd.docker.distribution.manifest.v2+json"
    }
  };
  const result = await axiosI.get(`v2/${repo}/manifests/${tag}`, config);
  return {
    headers: result.headers,
    data: result.data
  };
}

async function chooseAction() {
  const prompt = new Select({
    name: "action",
    message: "Select an action",
    choices: ["list-tags", "delete-tags", "exit"]
  });

  return await prompt.run();
}

async function listTags() {
  const repo = await pickRepo();
  const tags = await fetchTags(repo);
  if (tags) {
    log("tags:\n" + JSON.stringify(tags.sort(), 0, 2));
  } else {
    logErr("This repository has no tags");
  }
}

async function deleteTags() {
  const repo = await pickRepo();
  const tags = await pickTags(repo);
  if (!tags) {
    return;
  }

  log(
    "The following tags will be deleted:\n" + JSON.stringify(tags.sort(), 0, 2)
  );
  const prompt = new Confirm({
    name: "question",
    message: "Really delete selected tags?"
  });

  const deleteConfirmed = await prompt.run();
  if (!deleteConfirmed) {
    log("Delete aborted");
    return;
  }

  log("Deleting tags");
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const { headers } = await getDetailsOfTag(repo, tag);
    const digest = headers["docker-content-digest"];
    await axiosI.delete(`v2/${repo}/manifests/${digest}`);
    log(` tag '${tag}' deleted`);
  }
}

async function run() {
  checkAndLogSettings();
  while (true) {
    try {
      const action = await chooseAction();
      if (action === "list-tags") {
        await listTags();
      } else if (action === "delete-tags") {
        await deleteTags();
      } else if (action === "exit") {
        process.exit();
      } else {
        logErr("Not implemented");
      }
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}

run();
