// Manually define the enums that would normally come from @prisma/client
export {}; // This makes the file a module

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED'
}




export default {
  UserRole,
  SubmissionStatus
};



