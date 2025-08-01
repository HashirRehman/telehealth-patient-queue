import { useCallback } from 'react'
import { PatientService } from '@/lib/bookings'
import { Patient } from '@/lib/database.types'
import { useData } from '@/contexts/DataContext'

export function usePatients() {
  const {
    patients,
    myPatients,
    isLoading,
    isRefreshing,
    refreshPatients,
    addPatientOptimistic,
    updatePatientOptimistic,
    deletePatientOptimistic,
  } = useData()

  const createPatient = useCallback(async (
    patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Patient> => {
    try {
      const newPatient = await PatientService.createPatient(patientData)
      
      addPatientOptimistic(newPatient)  
      
      return newPatient
    } catch (error) {
      await refreshPatients()
      throw error
    }
  }, [addPatientOptimistic, refreshPatients])

  const createStandalonePatient = useCallback(async (
    patientData: Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Patient> => {
    try {
      const newPatient = await PatientService.createStandalonePatient(patientData)
      
      addPatientOptimistic(newPatient)
      
      return newPatient
    } catch (error) {
      await refreshPatients()
      throw error
    }
  }, [addPatientOptimistic, refreshPatients])

  const updatePatient = useCallback(async (
    patientId: string,
    updates: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Patient> => {
    const currentPatient = patients.find(p => p.id === patientId)
    if (!currentPatient) {
      throw new Error('Patient not found')
    }

    updatePatientOptimistic(patientId, updates)

    try {
      const updatedPatient = await PatientService.updatePatient(patientId, updates)
      
      updatePatientOptimistic(patientId, updatedPatient)
      
      return updatedPatient
    } catch (error) {
      updatePatientOptimistic(patientId, currentPatient)
      throw error
    }
  }, [patients, updatePatientOptimistic])

  const deletePatient = useCallback(async (patientId: string): Promise<void> => {
    const currentPatient = patients.find(p => p.id === patientId)
    if (!currentPatient) {
      throw new Error('Patient not found')
    }

    deletePatientOptimistic(patientId)

    try {
      await PatientService.deletePatient(patientId)
    } catch (error) {
      addPatientOptimistic(currentPatient)
      throw error
    }
  }, [patients, deletePatientOptimistic, addPatientOptimistic])

  const getPatientById = useCallback((patientId: string) => {
    return patients.find(patient => patient.id === patientId)
  }, [patients])

  const searchPatients = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return patients.filter(patient => 
      patient.full_name.toLowerCase().includes(lowercaseQuery) ||
      patient.email.toLowerCase().includes(lowercaseQuery) ||
      (patient.phone && patient.phone.includes(query))
    )
  }, [patients])

  const getPatientsWithoutUser = useCallback(() => {
    return patients.filter(patient => !patient.user_id)
  }, [patients])

  const getPatientsWithUser = useCallback(() => {
    return patients.filter(patient => patient.user_id)
  }, [patients])

  return {
    patients,
    myPatients,
    isLoading,
    isRefreshing,
    createPatient,
    createStandalonePatient,
    updatePatient,
    deletePatient,
    refreshPatients,
    getPatientById,
    searchPatients,
    getPatientsWithoutUser,
    getPatientsWithUser,
  }
} 