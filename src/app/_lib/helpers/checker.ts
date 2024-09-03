export const checkPermission = async (permissionName: 'camera' | 'microphone'): Promise<string> => {
  try {
    const permissionStatus = await navigator.permissions.query({
      name: permissionName as PermissionName,
    })
    // console.log(`Status izin ${permissionName}:`, permissionStatus.state)

    if (permissionStatus.state === 'granted') {
      // console.log(`Izin ${permissionName} allowed.`)
      return 'allowed'
    } else if (permissionStatus.state === 'denied') {
      // console.log(`Izin ${permissionName} denied.`)
      return 'denied'
    } else {
      // console.log(`Izin ${permissionName} belum diberikan.`)
      return 'not-allowed'
    }
  } catch (error) {
    console.error(`Error checking permissions ${permissionName}:`, error)
    throw error // Re-throw the error if needed
  }
}

// check value
export const isEmpty = (value: any) => [null, undefined, ''].includes(value)
