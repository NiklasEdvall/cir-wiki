---
title: PET-BIDS on SPICE
---

The Brain Imaging Data Structure [BIDS](https://bids-specification.readthedocs.io/en/stable/) is a community driven standard for organizing imaging data that simplify data sharing and collaboration. Organizing your data according to BIDS promote data sharing and enable the use of common pre-processing pipelines and tools (e.g. [PETPrep](https://petprep.readthedocs.io/en/latest/)), promoting traceable and reproducible research.

## Your data at CIR
If you don't have a project or are starting up data collection at BMIC, consult the [road map for projects at CIR](https://ki.se/en/research/research-areas-centres-and-networks/research-centres/centre-for-imaging-research-cir/road-map-for-projects-at-cir) for logical next steps for you to consider. The [data collection page](https://k-cir.github.io/cir-wiki/01_data_collection/) provide context for how and why CIR gather data for your project and how to register your data collection.

## BMIC raw data
Research data collected at BMIC should ??????. Doing so, and registering your session in the [CIR-session Redcap form](https://redcap.link/cir-session) ensure your data is collected in your project folder on [SPICE](https://k-cir.github.io/cir-wiki/SPICE/) within 24 hours. The data is stored in the original DICOM format and organized according to a study specific subject ID, session number and tracer.

The raw data in your project on SPICE will be structured like this:
```markdown
/data/projects/yourproject/raw/bmic/sub-XXX/ses-XX/
├── ucbj
|       ├ 0000001.dcm
|       ├ 0000002.dcm
|       ├ ....
|       └─0022500.dcm
└── pbr28
        ├ 0000001.dcm
        ├ 0000002.dcm
        ├ ....
        └─0022500.dcm
```
<br>
CIR offer support in organizing your data as BIDS and provide an simplified interface for using [dcm2bids](https://unfmontreal.github.io/Dcm2Bids/3.2.0/) and [pypet2bids](https://pet2bids.readthedocs.io/en/latest/index.html). Essentially, dcm2bids look through your raw data, check if the DICOM metadata match the criteria you specify in a config file and if so, convert those DICOM files to Nifti and organize them in a BIDS format. While pypet2bids normally does not use a config file, we have integrated this here to harmonize with the BIDS conversion used in MRI. This offers more control over the data, while still using the PET specific conversion used by pypet2bids. 

The dcm2bids config file is a JSON file that specify what criteria to look for in the DICOM metadata for each sequence in your protocol and how to name the output files. Building this config file can be a bit tricky, but CIR offer this helper that extract the relevant DICOM metadata from your data and present it in an interactive table in your browser so you can select what criteria to include in your config file.

This is done with two repositories, publicly available on Github:

<p style="text-align: left; font-size: 36px; font-weight: bold; margin: 0 !important; padding: 0; line-height: 1.2;">
  <a href="https://github.com/k-CIR/bids-utils-mr" target="_blank">1. bids-utils-mr</a>
</p>
<p style="margin-top: 0;">Clone the repository to your project folder on SPICE (using git). It will manage all the processing on SPICE and setup a server for you to inspect your data, create a config file and run processing via the browser on your local computer. The repository contain:</p>

- **index.html** - A html file with an interface for running dcm2bids
- **server.py** - A python script that set up an http server that function as a bridge between SPICE, were the process is happening, and your local computer.

<p style="text-align: left; font-size: 36px; font-weight: bold; margin: 0 !important; padding: 0; line-height: 1.2;">
  <a href="https://github.com/k-CIR/serve-mr-bids" target="_blank">2. serve-mr-bids</a>
</p>
<p style="margin-top: 0;">Clone this repository to your local machine. It contains a simple script that prompt for your user details for connecting to SPICE and project name.</p>

- **ssh-connect.sh** - A shell script for connecting to SPICE via SSH prompting you for username, project and password (if you don't have SSH keys setup). The script will also setup port forwarding for you to be able to access the server running on SPICE from your local computer. On connection it prints a unique URL to terminal that you can open in your local browser to access the interface for running dcm2bids on SPICE.

**Note:** As always you need to be on the KI network or connected to KI via VPN to access SPICE. You also need to have a user account on SPICE and access to the project you want to work with.

<br>

# Step by step guide
## 0. Know your data
Before you start, make sure you have an understanding of the data collected for your project. What sequences do you have in your protocol and how are they organized? What are ligands are you expecting in your data? Do you need to recode your data, e.g. if you have other data that you want BIDS subject and session IDs to match?

This approach assume your data is organized as it is delivered from CIR, i.e. on SPICE in `/data/projects/yourproject/raw/bmic` - if you have renamed it, moved it, converted or transformed it already - you will run in to problems.

## 1. Get repositories
Clone the two repositories mentioned above, [bids-utils-mr](https://github.com/k-CIR/bids-utils-mr) to your project folder on SPICE and [serve-mr-bids](https://github.com/k-CIR/serve-mr-bids) to your local computer. If you are new to git and github, plenty of guides are available [online](https://google.com/search?q=git+github+tutorial+how to clone a repository). And there is a brief description on how to set up git with an SSH key for authentication in the [SPICE wiki pag: version control with git](https://k-cir.github.io/cir-wiki/SPICE/02_best_practice/#version-control-with-git).

## 2. Connect to SPICE and start the server
Run the `ssh-connect.sh` script from the `serve-mr-bids` repository on your local computer: `bash ssh-connect.sh`. On Windows, it is easiest to use [Git Bash](https://git-scm.com/install/windows). This will prompt you for your SPICE username, project name and password (if you don't have SSH keys setup). After connection, the script will set up port forwarding for you to be able to access the server running on SPICE from your local computer. On connection, it prints a URL, unique to this session, to terminal that you can open (ctrl+click link in Git Bash) in your local browser to access the interface for running dcm2bids on SPICE.

**Note:** the project name must be specified as its path/folder name in `/data/projects`.

![Edit this page screenshot]({{ picture_path }}/serve-mr-bids.png){ width="650" }
/// caption
What it looks like when user **nikedv** connects to project **capsi** using an SSH key for authentication.
///


Based on the availability of the raw data folder `/data/projects/yourproject/raw/bmic`, a PET tab will show up that includes all tools necessary to BIDSify PET data. If your project folder also contains a raw MRI folder `/data/projects/yourproject/raw/mri`, you will also have an MRI tab with similar functionalities. See [the MRI page](../../mrc/mrc-bids.md) for how to convert your MRI data to BIDS. 

## 3. Analyze your data
Open the URL in your local browser. If this is your first time, you will see the window below. You are prompted to select one representative session from your data. This session will be analyzed with the [dcm2bids_helper](https://unfmontreal.github.io/Dcm2Bids/3.2.0/tutorial/first-steps/#dcm2bids_helper-command) function. Make sure to use a session that is complete and contains all sequences you want in your final data set. 

This function goes through the DICOM files in the selected session and export their unique DICOM meta data to a JSON file for each unique sequence. These are saved in the `bids-utils-mr` folder on SPICE under `dcm2bids_helper/helper`. The config is saved in the `bids-utils-mr` folder as `dcm2bids_config_pet.json`

Note that while you can use dcm2niix to convert your CT sequence to BIDS, there is no official BIDS for CT yet. File naming from CT conversion will follow the BIDS Extension Proposal for CT [BEP-024](https://bids.neuroimaging.io/extensions/beps/bep_024.html). If you need your BIDS dataset to be fully BIDS compliant as checked by the BIDS validator, do not convert your CT data to BIDS.

![Edit this page screenshot]({{ picture_path }}/PET_DICOM_analyze.png){ width="750" }
/// caption
///

Clicking **Analyze DICOM fields** will start the analysis. Depending on how many and what sequences are in the selected session, this will take a couple of minutes to complete. The ouput from `dcm2bids_helper` is printed in the faux terminal window on the page. When the analysis is done, a summary of the most commonly used fields are printed in a table in the browser so that you can use these to build your config file for dcm2bids. These are:

- `Series number`: The order the sequence was run in your protocol.
- `Series description`: The name of the sequence in your protocol.
- `Protocol name`: The name of the protocol, often including the name of your project and tracer
- `Modality`: PT for PET and CT for CT
- `Image type`: A list of keywords describing the sequence, e.g. `ORIGINAL`, `PRIMARY`, `PERFUSION`
- `Radiopharmaceutical`: The name of the radiopharmaceutical in your dicom header, note that if this is incorrect, you should edit your json files to included updated tracer info

You *can* select and analyze different sessions for defining your config file, but easiest for you is to select a session that you know contain all the sequences you are interested in. Check the box `Force dcm2bids_helper` to overwrite the current JSON helper files with new ones.

## 4. Build config file

<p style="text-align: left; font-size: 22px; font-weight: bold; margin: 0 !important; padding: 0; line-height: 1.2;">The input</p>
<p style="margin-top: 0;">When <code>dcm2bids_helper</code> is done, the section <b>2. Specify config</b> shows up. This section summarize the DICOM fields from the JSON files created by <code>dcm2bids_helper</code> (i.e. your representative session). Now, you can use what is in your data to construct a config file for <code>dcm2bids</code> so it knows what inputs to look for in your raw data and what outputs to genarate as BIDS. This is an important step that can require some detective work, especially if you skipped step 0 above, but you only need to do this once.</p>

If you ran the helper before, this table will show the summary from the last session you analyzed. In the image below is an example of a session that has one CT sequence and two PET sequences, the original dynamic data and the data with an additional motion correction.  

The left columns under **INPUT** are used to define the inputs for `dcm2bids`. That is, what do you want `dcm2bids` to look for in your data. Click on the fields in the table to select them to be included as a criteria for that sequence in the config file. You must select at least one field as a criteria in each sequence you want included.

If you want `dcm2bids` to skip a sequence, simply do not select any criteria for that sequence and it will be ignored, and not included in the BIDS output.

![Edit this page screenshot]({{ picture_path }}/PET_BIDS_config.png){ width="750" }
/// caption
///

Note that the two PET sequences and the CT sequence have the same Protocol name, so make sure you select a unique identifier  (in this case Series description) or unique combination of identifiers for every included sequence.

<br>
<p style="text-align: left; font-size: 22px; font-weight: bold; margin: 0 !important; padding: 0; line-height: 1.2;">The output</p>
<p style="margin-top: 0;">For the output section you MUST specify the <b>datatype </b>and <b>suffix</b> as indicated by an angry asterisk. For data from BMIC, datatype is either <code>pet</code>, or <code>anat</code>. The suffix MUST match the datatype, and selecting the datatype will limit the options for the suffic. For projects with only one tracer, you do not have to fill in trc. However, in projects with multiple tracers, failing to fill in <code>trc</code> will lead to issues, as both sequences from the same subject and session will be saved under the same name. Similarly, different reconstructions should use distinct <code>rec</code> flags</p>

In the image below, you can see we have specified datatype `pet` and suffix `pet` for the PET sequence with `trc` as ucbj, and datatype `ct` with suffix `ct` for the CT sequence. This will result in the PET sequence being saved as `sub-XXX_ses-XX_trc-ucbj_pet.nii.gz` and the motion correct PET being saved as `sub-XXX_ses-XX_trc-ucbj_rec-acdyn_pet.nii.gz`. The CT sequence will be saved as `sub-XXX_ses-XX_ct.nii.gz` in the BIDS output, but keep in mind that there is no official CT BIDS yet. 

![Edit this page screenshot]({{ picture_path }}/PET_config_output.png){ width="1100" }
/// caption
///

The other output fields are optional but can be used to further specify unique output file names. For example, many fMRI protocols include a task that should then be specified. Consult the [BIDS documentation](https://bids-specification.readthedocs.io/en/latest/appendices/entities.html) for the use of different entities, in short:

- Task name `task`: The name of the task performed during the scan, e.g. `rest` for resting state PET
- Run `run`: The run number of the sequence. Useful if you have more than one run of the same sequence in your protocol

When you have specified a unique input as criteria, and a unique output for the resulting BIDS, for each sequence you want to include you click **Generate config file** to write your specifications to `dcm2bids_config_pet.json` in the `bids-utils-mr` folder on SPICE. This is the config file that will be used as input for the BIDS conversion, which uses a procedure similar to `dcm2bids`. This file will be loaded automatically next time you open this page, but you can also load it manually by clicking **Load config file**.

If you do not have a complete, representative session with all the sequences you want to include in your BIDS output, you can still use **Append to config** to append a new sequence input criteria and output structure to the config file while keeping the existing specifications.

You can also edit the config file manually if you want, in the tab **Config Editor** - but be careful to keep the JSON format.

## 5. Inspect your config file
You can view and make manual edits to your config file in the tab **Config Editor**. Be careful to keep the JSON format if you make manual edits here. It may be a good idea to keep a backup of your config file, both for book keeping and especially before making manual edits.

![Edit this page screenshot]({{ picture_path }}/mr-bids6.png){ width="650" }
/// caption
What the bare bones of the config file look like - a JSON file with a list of dictionaries. Here an example from MRI is shown.
///

## 6. Check subjects and sessions
On the final tab **Make BIDS** you first check that paths you are using in your project folder are correct and then click **Discover sessions** to list all the sessions available for you to BIDSify.

![Edit this page screenshot]({{ picture_path }}/PET_BIDS_run.png){ width="950" }
/// caption
///

A table will show all subjects and sessions available in your raw data folder. You can specify which subjects and sessions to include in the BIDS output by checking the boxes in the table. Generally CIR will deliver your data in a pseduo-BIDS format but you can rename a subject and session if your raw data is not matching what you need for your BIDS output. Your recode-key will be saved as `session_recode_pet.csv` in the `bids-utils-mr/tabs/pet-bids` folder on SPICE for you to keep track of how you have renamed your data. Below is an example of MRI data with a participant ID that needs recoding. 

![Edit this page screenshot]({{ picture_path }}/mr-bids8.png){ width="950" }
/// caption
///

In the image above we see two sessions discovered, one subject is saved as an ID and date-time `12345_20231224_133705`, a legacy format for MRI data at MRC. The participant ID is correctly extracted, but doesn't match our other subject and there is no session number.

We simply type in a new subject ID and session number in the table to recode this session to match the BIDS output we want. In this case, we recode the subject to `sub-012` and session to `ses-01`. This is saved in the recode key so that next time we open this page, the same session is recoded to the same subject and session ID. Three digit subject IDs and two digit session numbers, both with leading zero-padding, are recommended.

![Edit this page screenshot]({{ picture_path }}/mr-bids9.png){ width="950" }
/// caption
///

## 7. Run PET BIDS
Finally, you click **Run PET BIDS** to start the processing. This will run `pypet2bids` for any PET sequences and `dcm2niix` for any CT sequences. The conversion is executed using both the config and the recoding csv. 

Depending on how many sessions you have selected and how many sequences are in your protocol, this can take a while to complete. The output from the conversion is printed in the faux terminal window on the page so you can follow the progress and check for any errors.

This process is designed to be able to run regularly during your project. No need to wait until you have collected all your data to start organizing it as BIDS. Rather, start early to identify and correct any issues with your config file or mismatch naming in your protocol or raw data.

Your config file and recode key are saved in the `bids-utils-mr` folder in your project folder on SPICE (config in `bids-utils-mr/dcm2bids_config_pet.json` and recode key in `bids-utils-mr/tabs/pet-bids/sessions_recode_pet.json`) and running the BIDS conversion does not overwrite already existing BIDS files unless you tell it to (by checking `--clobber`).


## 8. Celebrate
Congratulations!! 🎉 You have now organized your data as BIDS and can start using common pre-processing pipelines and tools for your data analysis. You are contributing to making your data more FAIR and reusable for other researchers, and you are saving time for yourself and others in the future by not having to re-invent the wheel for organizing your data for every new project. You can also share your config file with other researchers at CIR to further promote efficient data handling and sharing of best practices between projects.