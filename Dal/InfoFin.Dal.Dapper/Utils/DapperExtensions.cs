using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace InfoFin.Dal.Dapper.Utils
{
    public static class DapperExtensions
    {
        public static DataTable ToDataTable<T>(this List<T> iList)
        {
            if (ShouldCreateScalarDataTable(typeof(T)))
            {
                DataTable dataTable = new DataTable();
                dataTable.Columns.Add("Id", Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T));

                foreach (T iListItem in iList)
                    dataTable.Rows.Add(iListItem);

                return dataTable;
            }

            return iList.ToDataTable(GetColumnNames(typeof(T)));
        }

        public static DataTable ToDataTable<T>(this List<T> iList, params string[] columnNames)
        {
            DataTable dataTable = new DataTable();
            PropertyDescriptorCollection propertyDescriptorCollection =
                TypeDescriptor.GetProperties(typeof(T));

            foreach (string columnName in columnNames)
            {
                PropertyDescriptor propertyDescriptor = propertyDescriptorCollection.Find(columnName, false);
                if (propertyDescriptor is null)
                    continue;

                Type type = Nullable.GetUnderlyingType(propertyDescriptor.PropertyType) ?? propertyDescriptor.PropertyType;
                dataTable.Columns.Add(propertyDescriptor.Name, type);
            }

            foreach (T iListItem in iList)
            {
                object[] values = new object[dataTable.Columns.Count];
                for (int i = 0; i < dataTable.Columns.Count; i++)
                    values[i] = propertyDescriptorCollection[dataTable.Columns[i].ColumnName].GetValue(iListItem);

                dataTable.Rows.Add(values);
            }

            return dataTable;
        }

        private static string[] GetColumnNames(Type type)
        {
            return TypeDescriptor.GetProperties(type)
                .Cast<PropertyDescriptor>()
                .Select(property => property.Name)
                .ToArray();
        }

        private static bool ShouldCreateScalarDataTable(Type type)
        {
            Type nonNullableType = Nullable.GetUnderlyingType(type) ?? type;
            return nonNullableType.IsPrimitive
                || nonNullableType == typeof(string)
                || nonNullableType == typeof(Guid)
                || nonNullableType == typeof(decimal)
                || nonNullableType == typeof(DateTime)
                || nonNullableType == typeof(DateTimeOffset)
                || nonNullableType == typeof(TimeSpan)
                || nonNullableType == typeof(byte[]);
        }
    }
}