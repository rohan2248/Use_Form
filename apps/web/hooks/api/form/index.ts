import { trpc } from "~/trpc/client";

export const useSubmitForm = () => {
  const {
    mutateAsync: submitFormAsync,
    mutate: submitForm,
    error,
    isError,
    isPending,
    isSuccess,
    status,
  } = trpc.submission.submitForm.useMutation();

  return { submitFormAsync, submitForm, error, isError, isPending, isSuccess, status };
};

export const useGetFormSubmissions = (formId: string) => {
  const {
    data: submissions,
    error,
    isLoading,
    isFetched,
    isFetching,
    status,
  } = trpc.submission.getFormSubmissions.useQuery({ formId }, { enabled: !!formId });

  return { submissions, error, isLoading, isFetched, isFetching, status };
};

export const useGetForm = (formId: string) => {
  const {
    data: form,
    error,
    isLoading,
    isFetched,
    isFetching,
    status,
  } = trpc.form.getForm.useQuery({ formId }, { enabled: !!formId });

  return { form, error, isLoading, isFetched, isFetching, status };
};

export const useGetFields = (formId: string) => {
  const {
    data: fields,
    error,
    isLoading,
    isFetched,
    isFetching,
    status,
  } = trpc.form.getFields.useQuery({ formId }, { enabled: !!formId });

  return { fields, error, isLoading, isFetched, isFetching, status };
};

export const useCreateField = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createFieldAsync,
    mutate: createField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createField.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.getFields.invalidate({ formId: variables.formId });
    },
  });

  return { createFieldAsync, createField, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useDeleteField = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate();
    },
  });

  return { deleteFieldAsync, deleteField, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useUpdateField = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFieldAsync,
    mutate: updateField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate();
    },
  });

  return { updateFieldAsync, updateField, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useReorderField = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: reorderFieldAsync,
    mutate: reorderField,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.reorderField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate();
    },
  });

  return { reorderFieldAsync, reorderField, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useListForms = () => {
  const {
    data: forms,
    error,
    isLoading,
    isFetched,
    isFetching,
    status,
  } = trpc.form.listForms.useQuery();

  return { forms, error, isLoading, isFetched, isFetching, status };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: deleteFormAsync,
    mutate: deleteForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return { deleteFormAsync, deleteForm, error, failureCount, isError, isIdle, isSuccess, status };
};

export const useUpdateFormSettings = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormSettingsAsync,
    mutate: updateFormSettings,
    error,
    isPending,
    isError,
    isSuccess,
    status,
  } = trpc.form.updateFormSettings.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return { updateFormSettingsAsync, updateFormSettings, error, isPending, isError, isSuccess, status };
};

export const useUpdateFormVisibility = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormVisibilityAsync,
    mutate: updateFormVisibility,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormVisibility.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return { updateFormVisibilityAsync, updateFormVisibility, error, isError, isIdle, isSuccess, status };
};

export const useUpdateFormStatus = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormStatusAsync,
    mutate: updateFormStatus,
    error,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormStatus.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return { updateFormStatusAsync, updateFormStatus, error, isError, isIdle, isSuccess, status };
};

export const useGetAnalyticsSummary = () => {
  const {
    data: summary,
    error,
    isLoading,
  } = trpc.form.getAnalyticsSummary.useQuery();

  return { summary, error, isLoading };
};

export const useGetAllSubmissions = () => {
  const {
    data: submissions,
    error,
    isLoading,
    isFetched,
  } = trpc.submission.getAllSubmissions.useQuery();

  return { submissions, error, isLoading, isFetched };
};

export const useListPublicForms = () => {
  const {
    data: forms,
    error,
    isLoading,
    isFetched,
    isFetching,
    status,
  } = trpc.form.listPublicForms.useQuery();

  return { forms, error, isLoading, isFetched, isFetching, status };
};

export const useCreateForm = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    createFormAsync,
    createForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
