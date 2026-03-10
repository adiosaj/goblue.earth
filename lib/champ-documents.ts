/**
 * Champ Access Layer config. Update password and document links here.
 */

export const CHAMP_ACCESS_PASSWORD = 'IWILLBEACHAMP'

export const MISSION_ONE_URL =
  'https://drive.google.com/file/d/1yUm8K-CoUzPdCx5Dy3Tj7sbhuPu0z2j-/view?usp=drive_link'

export const CHAMP_FOLDER_URL =
  'https://drive.google.com/drive/folders/1gHwMnZ6VW5rQgWzWWD_jzkIidG9y9zqt?usp=drive_link'

export interface ChampDocument {
  title: string
  label: string
  url: string
  subtitle?: string
}

export const CHAMP_DOCUMENTS: ChampDocument[] = [
  {
    title: 'Year of the Sky',
    label: 'Read first',
    url: 'https://drive.google.com/file/d/1m1vysAcIydG6zgKNcL_VT3DtBCPpswas/view?usp=drive_link',
  },
  {
    title: 'Operational Handbook',
    label: 'Read second',
    url: 'https://drive.google.com/file/d/17WMOVcXBYkxiLYQ7LjsbmndQr2x1KVTK/view?usp=drive_link',
  },
  {
    title: 'Champ Agreement',
    label: 'Sign',
    url: 'https://drive.google.com/file/d/1A60LD_3zLDWwfazPB-ofUpGhZnD_JN3j/view?usp=drive_link',
  },
  {
    title: 'Mission 01',
    subtitle: 'GYC WAVE',
    label: 'Next step',
    url: MISSION_ONE_URL,
  },
]
