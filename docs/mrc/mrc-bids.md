---
title: BIDS at MRC
---

The Brain Imaging Data Structure [BIDS](https://bids-specification.readthedocs.io/en/stable/) is a community driven standard for organizing imaging data that simplify data sharing and collaboration. Organizing your data according to BIDS promote traceable and reproducible research and enable the use of common pre-processing pipelines and tools (e.g. [fmriprep](https://fmriprep.org/en/stable/) and [MRIQC](https://mriqc.readthedocs.io/en/latest/)). 

## Your data at CIR
If you don't have a project or are starting up data collection at MRC, consult the [road map for projects at CIR](https://ki.se/en/research/research-areas-centres-and-networks/research-centres/centre-for-imaging-research-cir/road-map-for-projects-at-cir) for logical next steps for you to consider. The [data collection page](https://k-cir.github.io/cir-wiki/01_data_collection/) provide context for how and why CIR gather data for your project and how to register your data collection.

## MRC raw data
Research data collected at MRC should be pushed to the server **FOU1** after each completed session. Doing so, and registering your session in the [CIR-session Redcap form](https://redcap.link/cir-session) ensure your data is collected in your project folder on [SPICE](https://k-cir.github.io/cir-wiki/SPICE/) within 24 hours. The data is stored in the original DICOM format and organized according to a study specific subject ID, session number and MRI sequence number.

The raw data in your project on SPICE will be structured like this:
```markdown
/data/projects/yourproject/raw/mri/sub-XXX/ses-XX/
├── 00000001
|       ├ 0000001.dcm
|       ├ 0000002.dcm
|       ├ ....
|       └─0000180.dcm
├── 00000002
|       ├ 0000001.dcm
|       ├ 0000002.dcm
|       ├ ....
|       └─0001985.dcm
└── 00000003
        ├ 0000001.dcm
        ├ 0000002.dcm
        ├ ....
        └─0022500.dcm
```
<br>

CIR offer support in organizing your data as BIDS and provide an simplified interface for using the [dcm2bids](https://unfmontreal.github.io/Dcm2Bids/3.2.0/) in [parallel](https://www.gnu.org/software/parallel/) to effeciently organizing your data on SPICE.

This is done with two repositories, publicily available on Github:

<p style="text-align: left; font-size: 36px; font-weight: bold; margin: 0 !important; padding: 0; line-height: 1.2;">
  <a href="https://github.com/k-CIR/bids-utils-mr" target="_blank">1. bids-utils-mr</a>
</p>
<p style="margin-top: 0;">Clone the repository to your project folder on SPICE (using git). It will manage all the processing on SPICE and setup a server for you to inspect your data, create a config file and run processing via the browser on your local computer. The repository contain:</p>

- **index.html** - A html file with an interface for running dcm2bids
- **server.py** - A python script that set up an http server that function as a bridge between SPICE, were the process is happening, and your local computer.
- **config_builder.py** - A python script that help you build the config file needed for dcm2bids.
- **bids_runner.py** - A script running dcm2bids in parallel on SPICE.

<p style="text-align: left; font-size: 36px; font-weight: bold; margin: 0 !important; padding: 0; line-height: 1.2;">
  <a href="https://github.com/k-CIR/serve-mr-bids" target="_blank">2. serve-mr-bids</a>
</p>
<p style="margin-top: 0;">Clone this repository to your local machine. It contains a simple script that prompt for your user details for connecting to SPICE and project name.</p>

- **ssh-connect.sh** - A shell script for connecting to SPICE via SSH prompting you for username, project and password (if you don't have SSH keys setup). The script will also setup port forwarding for you to be able to access the server running on SPICE from your local computer. On connection it prints a unique URL to terminal that you can open in your local browser to access the interface for running dcm2bids on SPICE.

**Note:** As always you need to be on the KI network or connected to KI via VPN to access SPICE. You also need to have a user account on SPICE and access to the project you want to work with.

<br>

# Step by step guide

### 0. Know your data
Before you start, make sure you have an understanding of the data collected for your project. What sequences do you have in your protocol and how are they organized? What are the tasks included and patient instructions included in the protocol? Do you need to recode your data, e.g. if you have other data that you want BIDS subject and sessions ID to match?

This approach assume your data is organized as it is delivered from CIR, i.e. on SPICE in `/data/projects/yourproject/raw/mri` - if you have renamed it, moved it, converted or transformed it already - you will run in to problems.

### 1. Get repositories
Clone the two repositories mentioned above, [bids-utils-mr](https://github.com/k-CIR/bids-utils-mr) to your project folder on SPICE and [serve-mr-bids](https://github.com/k-CIR/serve-mr-bids) to your local computer. If you are new to git and github, plenty of guides are available [online](https://google.com/search?q=git+github+tutorial+how to clone a repository). And there is a brief description on how to set up git with an SSh key for authentication in the [SPICE wiki page](https://k-cir.github.io/cir-wiki/SPICE/02_best_practice/#version-control-with-git).

### 2. Connect to SPICE and start the server
Run the `ssh-connect.sh` script from the `serve-mr-bids` repository on your local computer: `bash ssh-connect.sh` (use cmd or git bash on windows). This will prompt you for your SPICE username, project name and password (if you don't have SSH keys setup). After connection, the script will set up port forwarding for you to be able to access the server running on SPICE from your local computer. On connection it prints a URL, unique to this session, to terminal that you can open in your local browser to access the interface for running dcm2bids on SPICE.

**Note:** the project name must be specified as its path/folder name in `/data/projects`.

![Edit this page screenshot]({{ picture_path }}/serve-mr-bids.png){ width="650" }
/// caption
What it looks like when user **nikedv** connects to project **capsi** using an SSH key for authentication.
///

### 3. Analyze your data
Open the URL in your local browser. If this is your first time, you will see the window below. You are prompted to select one representative session from your data. This session will be analyzed with the [dcm2bids_helper](https://unfmontreal.github.io/Dcm2Bids/3.2.0/tutorial/first-steps/#dcm2bids_helper-command) function.

This function go through the DICOM files in the selected session and export their unique DICOM meta data to a JSON file for each unique sequence. These are saved in the `bids-utils-mr` folder on SPICE under `dcm2bids_helper/helper`.

![Edit this page screenshot]({{ picture_path }}/mr-bids1.png){ width="750" }
/// caption
///

Clicking **Analyze DICOM fields** will start the analysis. Depending on how many and what sequences are in the selected session, this will take up to a couple of minutes to complete. The ouput from `dcm2bids_helper` is printed in the faux terminal window on the page. When the analysis is done, a summary of the most useful fields are printed in a table in the browser so that you can use these to build your config file for dcm2bids. These are:

- `Series number`: The order of which this sequence was run in your protocol.
- `Series description`: The name of the sequence in your protocol.
- `Pulse sequence name`: The name of the sequence as it is saved in the DICOM metadata.
- `Image type`: A list of keywords describing the sequence, e.g. `ORIGINAL`, `PRIMARY`, `PERFUSION`

You *can* select and analyze different sessions, but easiest for you is to select a session that you know contain all the sequences you are interested in. Check the box `Force dcm2bids_helper` to overwrite the current JSON helper files with new ones.

### 4. Build config file

**The input** <br>
When `dcm2bids_helper` is done, the section **2. Specify config** shows up. This section summarize the DICOM fields from the JSON files created by `dcm2bids_helper`. Now, you can use what is in your data to construct a config file for `dcm2bids` so it knows what inputs to look for and what outputs to genarate. This is an important step that can require some detective work, esepecially if you skipped step 0 above, but you only need to do this once.

If you ran the helper before, this table will show the summary from the last session you analyzed. In the image below is an example of a session that has one structural T1 sequence and an Arterial Spin Labeling (ASL) sequence.

The left columns under **INPUT** are used to define the inputs for `dcm2bids`. That is, what do you want `dcm2bids` to look for in your data. Click on the fields in the table to select them to be included as a criteria for that sequence in the config file. You must select at least one field as a criteria in each sequence you want included.

![Edit this page screenshot]({{ picture_path }}/mr-bids2.png){ width="750" }
/// caption
///

Note that the ASL sequence (Series number 5) is split in two entries. Some sequences are split and need to be BIDSified separately. In the case of this ASL sequence, we see in the `Image type` that the first entry is the `ORIGINAL` ASL data and the second entry the `DERIVED` m0 reference scan.

![Edit this page screenshot]({{ picture_path }}/mr-bids3.png){ width="750" }
/// caption
///

For the T1 its enough to select its unique `Series description` as a criteria for identifying this as a unique sequence in the data. For the ASL sequence, the `Image type` must also be included as a criteria to keep the original ASL data and the m0 reference scan separate in the BIDS output. That is, the combination of criteria must be unique for each row of data that you want in the BIDS output. If not, dcm2bids will not know how to separate them and they will be merged in the BIDS output, or separated by the best guess dcm2bids can make, usually by includig a `run-1` and `run-2` tag.

#### The output


### 5. Inspect config file

### 6. Check subjects and sessions

### 7. Run dcm2bids