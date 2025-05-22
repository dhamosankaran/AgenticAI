import React, { useState } from 'react';

interface UserProfileFormProps {
  onSubmit: (data: UserProfileData) => void;
}

interface UserProfileData {
  name: string;
  age: number;
  income: number;
  risk_tolerance: string;
  investment_goal: string;
  investment_horizon: string;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserProfileData>({
    name: '',
    age: 0,
    income: 0,
    risk_tolerance: 'moderate',
    investment_goal: 'balanced_growth',
    investment_horizon: 'long-term',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'income' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
          min="18"
          max="100"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="income" className="block text-sm font-medium text-gray-700">
          Annual Income ($)
        </label>
        <input
          type="number"
          id="income"
          name="income"
          value={formData.income}
          onChange={handleChange}
          required
          min="0"
          step="1000"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="risk_tolerance" className="block text-sm font-medium text-gray-700">
          Risk Tolerance
        </label>
        <select
          id="risk_tolerance"
          name="risk_tolerance"
          value={formData.risk_tolerance}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      <div>
        <label htmlFor="investment_goal" className="block text-sm font-medium text-gray-700">
          Investment Goal
        </label>
        <select
          id="investment_goal"
          name="investment_goal"
          value={formData.investment_goal}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="preservation">Capital Preservation</option>
          <option value="balanced_growth">Balanced Growth</option>
          <option value="aggressive_growth">Aggressive Growth</option>
        </select>
      </div>

      <div>
        <label htmlFor="investment_horizon" className="block text-sm font-medium text-gray-700">
          Investment Horizon
        </label>
        <select
          id="investment_horizon"
          name="investment_horizon"
          value={formData.investment_horizon}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="short-term">Short-term (1-3 years)</option>
          <option value="medium-term">Medium-term (3-7 years)</option>
          <option value="long-term">Long-term (7+ years)</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Create Profile
      </button>
    </form>
  );
};

export default UserProfileForm; 