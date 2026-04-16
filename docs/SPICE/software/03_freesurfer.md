---
title: FreeSurfer
---

FreeSurfer is not currently supported natively on Ubuntu 24 (the operating system used on SPICE). To use FreeSurfer, run it through the [FreeSurfer and MNE-Python container](../singularity_containers/05_freesurfer_mne.md).

This container includes:

- FreeSurfer
- MNE-Python


## Start the container
Run the following command from a terminal.

This mounts your current working directory into the container, making files in that directory available inside the container. Make sure you are in the directory where your data is located (or in a parent directory).

```bash
singularity shell \
    --bind $(pwd):$(pwd) \
    --cleanenv \
    /scratch/singularityContainers/mne_freesurfer.sif
```

## FreeSurfer usage

You need a freesurfer license. If you don't have one, follow this [link](https://surfer.nmr.mgh.harvard.edu/registration.html). Upload it to SPICE and define the path to the FS_LICENSE in the singularity terminal.

```
export FS_LICENSE=<path_to_freesurfer_license>
```

Next step is to define the freesurfer SUBJECTS_DIR where the output will be saved to.
```
SUBJECTS_DIR="<path_to_SUBJECTS_DIR>"
```

Now you are ready to run freesurfer!
```
recon-all -subject <subject id> -i <path_to_t1> -all
```

## FreeSurfer and MNE-Python
If you are performing MEG/EEG source localisation, you will also need MNE-Python to generate the Boundary Element Model (BEM) surfaces required for forward modelling. The container includes MNE-Python for this purpose.

Create the BEM surfaces using:

```bash
mne watershed_bem --subject <subject_id> --subjects-dir <path_to_SUBJECTS_DIR> 
```

Optionally, you can create a [dense scalp surface](https://mne.tools/stable/auto_tutorials/forward/30_forward.html#visualizing-the-coregistration). This is useful for visual coregistration, alignment of digitised head points, and marking fiducials.
```
mne make_scalp_surfaces \
  --subject <subject_id> \
  --subjects-dir <path_to_SUBJECTS_DIR> \
  --mri <path_to_MRI> \
  --no-decimate
```

The path supplied to --mri is relative to:
```
$SUBJECTS_DIR/<subject_id>/
```
For example, if the MRI file is located at:
```
$SUBJECTS_DIR/<subject_id>/orig/001.mgz
```

then use:
```
--mri orig/001.mgz
```
