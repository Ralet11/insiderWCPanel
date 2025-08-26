import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { createUser, updateUser } from '../store/users'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material'

export default function UserFormDialog({ initial, onClose }) {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [roles, setRoles] = useState('')
  const isEdit = !!initial

  useEffect(()=>{
    if (initial) {
      setEmail(initial.email)
      setDisplayName(initial.displayName)
      setRoles((initial.roles||[]).join(','))
    }
  }, [initial])

  async function save() {
    if (isEdit) {
      await dispatch(updateUser({ id: initial.id, data: { email, displayName, roles: roles.split(',').map(s=>s.trim()) } }))
    } else {
      await dispatch(createUser({ email, displayName, password, roles: roles.split(',').map(s=>s.trim()) }))
    }
    onClose()
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField label="Nombre" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          {!isEdit && <TextField label="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />}
          <TextField label="Roles (coma separados)" value={roles} onChange={e=>setRoles(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button onClick={save}>Guardar</Button>
      </DialogActions>
    </Dialog>
  )
}
