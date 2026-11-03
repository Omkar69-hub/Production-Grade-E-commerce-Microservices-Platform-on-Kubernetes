import React from 'react';
import { DepartmentPageLayout } from '../../components/department/DepartmentPageLayout';
import { DEPARTMENT_CONFIGS } from '../../data/departmentConfig';

export const GymPage: React.FC = () => {
  return <DepartmentPageLayout config={DEPARTMENT_CONFIGS.gym} />;
};

export default GymPage;

